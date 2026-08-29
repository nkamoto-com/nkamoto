import { randomBytes } from "node:crypto";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

import { BIP84_PATH, deriveBitcoinAddress } from "./derive.js";
import { generatePassphrase } from "./passphrase.js";

const ENTROPY_BYTES = 32;

export interface BitcoinWallet {
  readonly mnemonic: string;
  readonly passphrase: string;
  readonly derivationPath: typeof BIP84_PATH;
  readonly address: string;
}

function generateEntropy(): Uint8Array {
  return new Uint8Array(randomBytes(ENTROPY_BYTES));
}

export function generateMnemonic(
  entropy: Uint8Array = generateEntropy(),
): string {
  if (entropy.length !== ENTROPY_BYTES) {
    throw new RangeError("Entropy must contain exactly 32 bytes");
  }

  return bip39.entropyToMnemonic(entropy, wordlist);
}

export function generateWallet(): BitcoinWallet {
  const mnemonic = generateMnemonic();
  const passphrase = generatePassphrase();

  return {
    mnemonic,
    passphrase,
    derivationPath: BIP84_PATH,
    address: deriveBitcoinAddress(mnemonic, passphrase),
  };
}
