import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const hiddenRoot = path.join(process.cwd(), ".static-build-hidden");
const serverOnly = ["src/proxy.ts", "src/app/sign-in", "src/app/callback", "src/app/api/admin/invitations/route.ts", "src/app/api/feedback/route.ts", "src/app/api/events/route.ts", "src/components/auth-provider.tsx"];
const authProviderPath = path.join(process.cwd(), "src/components/auth-provider.tsx");
mkdirSync(hiddenRoot, { recursive: true });
rmSync(path.join(process.cwd(), ".next", "dev", "types"), { recursive: true, force: true });
const moved = [];
try {
  for (const relative of serverOnly) {
    const source = path.join(process.cwd(), relative);
    if (!existsSync(source)) continue;
    const destination = path.join(hiddenRoot, relative.replaceAll("/", "__"));
    renameSync(source, destination); moved.push([source, destination]);
  }
  writeFileSync(authProviderPath, 'export function AppAuthProvider({ children }: { children: React.ReactNode; enabled: boolean }) { return children; }\n');
  const result = spawnSync(command, ["next", "build"], {
    stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, STATIC_EXPORT: "true" },
  });
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  if (existsSync(authProviderPath)) rmSync(authProviderPath);
  for (const [source, destination] of moved.reverse()) { mkdirSync(path.dirname(source), { recursive: true }); renameSync(destination, source); }
  rmSync(hiddenRoot, { recursive: true, force: true });
}

if (process.exitCode) process.exit(process.exitCode);

const staticOutput = path.join(process.cwd(), ".next-static");
const output = path.join(process.cwd(), "out");
rmSync(output, { recursive: true, force: true });
cpSync(staticOutput, output, { recursive: true });
copyFileSync(
  path.join(output, "api", "qr", "yorkshire-roofing"),
  path.join(output, "api", "qr", "yorkshire-roofing.svg"),
);
copyFileSync(
  path.join(output, "widget", "yorkshire-roofing"),
  path.join(output, "widget", "yorkshire-roofing.js"),
);
