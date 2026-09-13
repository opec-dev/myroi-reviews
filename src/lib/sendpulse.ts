import "server-only";

export function normalizeSendPulseApiKey(value: string) {
  return value.trim();
}

export async function verifySendPulseApiKey(value: string) {
  const apiKey = normalizeSendPulseApiKey(value);
  if (!apiKey.startsWith("sp_apikey_")) {
    throw new Error(
      "Enter a SendPulse static API key copied directly from Account settings → API. It should begin with sp_apikey_ and must not contain a backslash.",
    );
  }

  const response = await fetch("https://api.sendpulse.com/user/info", {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "SendPulse rejected this API key (401). Copy the complete static API key from Account settings → API, then try again."
        : `SendPulse could not verify this API key (${response.status}). Try again or check the provider status.`,
    );
  }
  return apiKey;
}
