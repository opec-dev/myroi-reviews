import { spawnSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import path from "node:path";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["next", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, STATIC_EXPORT: "true" },
});

if (result.status !== 0) process.exit(result.status ?? 1);

const output = path.join(process.cwd(), "out");
copyFileSync(
  path.join(output, "api", "qr", "yorkshire-roofing"),
  path.join(output, "api", "qr", "yorkshire-roofing.svg"),
);
copyFileSync(
  path.join(output, "widget", "yorkshire-roofing"),
  path.join(output, "widget", "yorkshire-roofing.js"),
);
