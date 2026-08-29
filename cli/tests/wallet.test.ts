import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BIP84_PATH,
  deriveBitcoinAddress,
  generateMnemonic,
  generatePassphrase,
  generateWallet,
} from "../src/index.js";

const BIP84_VECTOR_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon about";

test("generated wallet has expected public metadata", () => {
  const wallet = generateWallet();

  assert.equal(wallet.derivationPath, BIP84_PATH);
  assert.match(wallet.address, /^bc1q/);
  assert.equal(wallet.mnemonic.split(/\s+/).length, 24);
  assert.equal(wallet.passphrase.split(/\s+/).length, 12);
  assert.equal("seed" in wallet, false);
});

test("official BIP-84 first receiving address vector", () => {
  const address = deriveBitcoinAddress(BIP84_VECTOR_MNEMONIC, "");

  assert.equal(
    address,
    "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu",
  );
});

test("address derivation is deterministic", () => {
  const first = deriveBitcoinAddress(BIP84_VECTOR_MNEMONIC, "TREZOR");
  const second = deriveBitcoinAddress(BIP84_VECTOR_MNEMONIC, "TREZOR");

  assert.equal(first, second);
});

test("different BIP-39 passphrases produce different addresses", () => {
  const first = deriveBitcoinAddress(BIP84_VECTOR_MNEMONIC, "first passphrase");
  const second = deriveBitcoinAddress(BIP84_VECTOR_MNEMONIC, "second passphrase");

  assert.notEqual(first, second);
});

test("generateMnemonic rejects incorrect entropy length", () => {
  assert.throws(
    () => generateMnemonic(new Uint8Array(16)),
    /exactly 32 bytes/,
  );
});

test("passphrase generator creates the requested number of words", () => {
  const passphrase = generatePassphrase(12);

  assert.equal(passphrase.split(/\s+/).length, 12);
});
