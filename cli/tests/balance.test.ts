import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isBitcoinAddress,
  satoshisToBtc,
} from "../src/index.js";

test("recognizes a Bitcoin mainnet bech32 address", () => {
  assert.equal(
    isBitcoinAddress("bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu"),
    true,
  );
});

test("rejects an invalid Bitcoin address", () => {
  assert.equal(isBitcoinAddress("not-a-bitcoin-address"), false);
});

test("formats satoshis as BTC", () => {
  assert.equal(satoshisToBtc(0n), "0.00000000");
  assert.equal(satoshisToBtc(1n), "0.00000001");
  assert.equal(satoshisToBtc(100_000_000n), "1.00000000");
  assert.equal(satoshisToBtc(123_456_789n), "1.23456789");
});
