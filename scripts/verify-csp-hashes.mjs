import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const buildRoot = join(projectRoot, "build", "client");
const nginxConfigPath = join(
  projectRoot,
  "ops",
  "nginx",
  "homesteadpuppies.org.conf",
);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }

  return files;
}

const expected = new Set();
for (const path of await htmlFiles(buildRoot)) {
  const html = await readFile(path, "utf8");
  const scripts = html.matchAll(
    /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of scripts) {
    const digest = createHash("sha256").update(match[1], "utf8").digest("base64");
    expected.add(`'sha256-${digest}'`);
  }
}

let nginxConfig = await readFile(nginxConfigPath, "utf8");
if (process.argv.includes("--write")) {
  let policies = 0;
  nginxConfig = nginxConfig.replace(/script-src\s+([^;]+);/g, (_, policy) => {
    policies += 1;
    const sources = policy.replace(/'sha256-[^']+'/g, "").trim().split(/\s+/);
    if (!sources.includes("'self'")) {
      throw new Error("CSP script-src must retain 'self'.");
    }
    return "script-src " + [...sources, ...[...expected].sort()].join(" ") + ";";
  });
  if (policies !== 1 || expected.size === 0) {
    throw new Error("Expected one script-src policy and a built React frontend.");
  }
  await writeFile(nginxConfigPath, nginxConfig, "utf8");
  console.log(`Updated CSP for ${expected.size} inline script hashes.`);
}
const configured = new Set(nginxConfig.match(/'sha256-[^']+'/g) || []);
const missing = [...expected].filter((hash) => !configured.has(hash));
const stale = [...configured].filter((hash) => !expected.has(hash));

if (missing.length || stale.length) {
  if (missing.length) console.error("Missing CSP hashes:\n" + missing.join("\n"));
  if (stale.length) console.error("Stale CSP hashes:\n" + stale.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`CSP verified: ${expected.size} exact inline script hashes.`);
}
