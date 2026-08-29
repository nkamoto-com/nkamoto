import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(projectRoot, "src", "cli.ts");

function runCli(...args: string[]) {
  return spawnSync(
    process.execPath,
    ["--import", "tsx", cli, ...args],
    {
      cwd: projectRoot,
      encoding: "utf8",
      input: "",
    },
  );
}

test("nkamoto with no command displays help", () => {
  const result = runCli();

  assert.equal(result.status, 0);
  assert.match(result.stdout, /NKAMOTO — Bitcoin wallet CLI/);
  assert.match(result.stdout, /generate/);
  assert.match(result.stdout, /validate/);
  assert.match(result.stdout, /balance/);
});

test("nkamoto --help displays help", () => {
  const result = runCli("--help");

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
});

test("nkamoto --version displays version", () => {
  const result = runCli("--version");

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^nkamoto 0\\.2\\.0/m);
});

test("unknown command displays help and fails", () => {
  const result = runCli("unknown-command");

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stderr, /Unknown command/);
});

test("balance requires a public address", () => {
  const result = runCli("balance");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage: nkamoto balance/);
});

test("validate refuses mnemonic command-line arguments", () => {
  const result = runCli("validate", "secret");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /do not pass secrets as arguments/);
});
