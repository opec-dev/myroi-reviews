param(
  [Parameter(Mandatory = $true)][string]$SitePath,
  [string]$Slug,
  [string]$ClaimToken
)

$ErrorActionPreference = "Stop"

function Get-ContentType([string]$Path) {
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "text/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".txt" { return "text/plain; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".ico" { return "image/x-icon" }
    default { return "application/octet-stream" }
  }
}

$siteRoot = Resolve-Path -LiteralPath $SitePath
$rootPrefix = $siteRoot.Path.TrimEnd("\") + "\"
$items = @(Get-ChildItem -LiteralPath $siteRoot -Recurse -File | Where-Object { $_.FullName -notmatch "\\\.herenow\\" } | ForEach-Object {
  [pscustomobject]@{
    path = $_.FullName.Substring($rootPrefix.Length).Replace("\", "/")
    size = $_.Length
    contentType = Get-ContentType $_.FullName
    hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
    fullName = $_.FullName
  }
})

$credentialsPath = Join-Path $env:USERPROFILE ".herenow\credentials"
$apiKey = $env:HERENOW_API_KEY
if (-not $apiKey -and (Test-Path -LiteralPath $credentialsPath)) {
  $apiKey = (Get-Content -LiteralPath $credentialsPath -Raw).Trim()
}

$headers = @{ "X-HereNow-Client" = "codex/powershell"; "content-type" = "application/json" }
if ($apiKey) { $headers.Authorization = "Bearer $apiKey" }

$files = @($items | ForEach-Object { [pscustomobject]@{ path = $_.path; size = $_.size; contentType = $_.contentType; hash = $_.hash } })
$bodyData = @{ files = $files; displayName = "myROI Reviews pilot"; displayDescription = "Yorkshire Roofing review management MVP"; spaMode = $true }
if ($ClaimToken) { $bodyData.claimToken = $ClaimToken }
$method = "Post"
$url = "https://here.now/api/v1/publish"
if ($Slug) { $method = "Put"; $url = "https://here.now/api/v1/publish/$Slug" }
$created = Invoke-RestMethod -Method $method -Uri $url -Headers $headers -Body ($bodyData | ConvertTo-Json -Depth 8)

foreach ($upload in @($created.upload.uploads)) {
  $local = $items | Where-Object { $_.path -eq $upload.path } | Select-Object -First 1
  $contentType = $upload.headers.'Content-Type'
  if (-not $contentType) { $contentType = $local.contentType }
  & curl.exe -sS -X PUT $upload.url -H "Content-Type: $contentType" --data-binary "@$($local.fullName)"
  if ($LASTEXITCODE -ne 0) { throw "Upload failed: $($upload.path)" }
}

$finalHeaders = @{ "content-type" = "application/json" }
if ($apiKey) { $finalHeaders.Authorization = "Bearer $apiKey" }
$finalized = Invoke-RestMethod -Method Post -Uri $created.upload.finalizeUrl -Headers $finalHeaders -Body (@{ versionId = $created.upload.versionId } | ConvertTo-Json)

[pscustomobject]@{
  siteUrl = $created.siteUrl
  slug = $created.slug
  authMode = $(if ($finalized.publishStatus.requestAuth -eq "api_key") { "authenticated" } else { "anonymous" })
  claimUrl = $created.claimUrl
  expiresAt = $finalized.publishStatus.expiresAt
  finalized = $finalized.success
} | ConvertTo-Json -Depth 5
