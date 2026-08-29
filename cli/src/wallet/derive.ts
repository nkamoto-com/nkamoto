import * as bip32 from "@scure/bip32";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import * as btc from "@scure/btc-signer";

export const BIP84_PATH = "m/84'/0'/0'/0/0";

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic, wordlist);
}

export function mnemonicToSeed(
  mnemonic: string,
  passphrase: string,
): Uint8Array {
  if (!validateMnemonic(mnemonic)) {
    throw new Error("Invalid BIP-39 mnemonic");
  }

  return bip39.mnemonicToSeedSync(mnemonic, passphrase);
}

export function deriveBitcoinAddress(
  mnemonic: string,
  passphrase: string,
): string {
  const seed = mnemonicToSeed(mnemonic, passphrase);
  const root = bip32.HDKey.fromMasterSeed(seed);
  const child = root.derive(BIP84_PATH);

  if (!child.publicKey) {
    throw new Error("Failed to derive BIP-84 public key");
  }

  const payment = btc.p2wpkh(child.publicKey);

  if (!payment.address) {
    throw new Error("Failed to derive Bitcoin address");
  }

  return payment.address;
}
