import assert from "node:assert/strict";
import { test } from "node:test";

import {
  generateMnemonic,
  mnemonicToSeed,
  validateMnemonic,
} from "../src/index.js";

test("canonical BIP-39 256-bit zero-entropy vector", () => {
  const expectedMnemonic =
    "abandon abandon abandon abandon abandon abandon " +
    "abandon abandon abandon abandon abandon about";

  assert.equal(generateMnemonic(new Uint8Array(32)), expectedMnemonic);
  assert.equal(validateMnemonic(expectedMnemonic), true);
});

test("canonical BIP-39 TREZOR seed vector", () => {
  const mnemonic =
    "abandon abandon abandon abandon abandon abandon " +
    "abandon abandon abandon abandon abandon about";

  const expectedSeed =
    "c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e" +
    "9efa3708e53495531f09a698e7463b04";

  const seed = Buffer.from(mnemonicToSeed(mnemonic, "TREZOR")).toString("hex");

  assert.equal(seed, expectedSeed);
});

test("invalid mnemonic is rejected", () => {
  const mnemonic =
    "abandon abandon abandon abandon abandon abandon " +
    "abandon abandon abandon abandon abandon abandon";

  assert.equal(validateMnemonic(mnemonic), false);
  assert.throws(() => mnemonicToSeed(mnemonic, ""));
});
