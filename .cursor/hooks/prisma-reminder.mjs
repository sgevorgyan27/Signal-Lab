#!/usr/bin/env node
import { readFileSync } from "node:fs";

const stdin = readFileSync(0, "utf8");
let payload = {};
try {
  payload = JSON.parse(stdin || "{}");
} catch {
  process.stdout.write("{}\n");
  process.exit(0);
}

const path =
  payload.file_path ||
  payload.path ||
  payload.input?.path ||
  payload.input?.file_path ||
  payload.tool_input?.path ||
  "";

const s = `${JSON.stringify(payload)}`;
const hit =
  String(path).includes("prisma/schema.prisma") ||
  s.includes("prisma/schema.prisma");

if (hit) {
  process.stdout.write(
    JSON.stringify({
      additional_context:
        "Prisma schema may have changed. From repo root run: npm run prisma:migrate (dev) or npm run prisma:deploy (CI/Docker). Then npm run build -w backend.",
    }) + "\n",
  );
} else {
  process.stdout.write("{}\n");
}
