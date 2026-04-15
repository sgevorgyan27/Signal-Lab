#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const stdin = readFileSync(0, "utf8");
let payload = {};
try {
  payload = JSON.parse(stdin || "{}");
} catch {
  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
  process.exit(0);
}

const cmd = String(payload.command ?? "");

if (!/\bgit\s+commit\b/.test(cmd)) {
  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
  process.exit(0);
}

let staged = "";
try {
  staged = execSync("git diff --cached --name-only", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
  process.exit(0);
}

const risky = staged
  .split("\n")
  .some((f) =>
    /^(?:\.env|\.env\.local|\.env\.production|.*\.pem|id_rsa)$/.test(
      f.trim(),
    ),
  );

if (risky) {
  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      user_message:
        "Blocked: staged files look like secrets or environment (.env, keys). Unstage them before committing.",
      agent_message:
        "Remove .env / key material from the git index; use .env.example only for templates.",
    }) + "\n",
  );
} else {
  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
}
