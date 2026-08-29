#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  EsploraBalanceProvider,
  isBitcoinAddress,
  satoshisToBtc,
} from "./balance.js";
import { renderQr } from "./qr.js";
import {
  BIP84_PATH,
  deriveBitcoinAddress,
  generateWallet,
  validateMnemonic,
} from "./index.js";

const VERSION = "0.2.0";

const HELP = `NKAMOTO — Bitcoin wallet CLI

Usage:
  nkamoto <command>

Commands:
  generate    Generate a new Bitcoin wallet
  qr          Generate a new wallet with qr code
  validate    Validate a BIP-39 mnemonic
  balance     Check a Bitcoin address balance

Options:
  -h, --help      Show help
  -v, --version   Show version

Examples:
  nkamoto generate
  nkamoto validate
  nkamoto balance bc1q...

Security:
  Never share your BIP-39 mnemonic or passphrase.
  Never put recovery secrets in shell arguments.
`;

function printHelp(): void {
  console.log(HELP);
}

function printVersion(): void {
  console.log(`nkamoto ${VERSION}`);
}

async function runGenerate(qr_included: boolean): Promise<void> {
  const wallet = generateWallet();

  console.log("");
  console.log("========================================");
  console.log("           NKAMOTO BTC WALLET");
  console.log("========================================");
  console.log("");
  console.log("Network:         Bitcoin Mainnet");
  console.log("Standard:        BIP-39");
  console.log("Address type:    BIP-84 / P2WPKH");
  console.log(`Derivation path: ${BIP84_PATH}`);
  console.log("");

  if (qr_included) {
    await printQr("BIP-39 MNEMONIC QR", wallet.mnemonic);
    await printQr("BIP-39 PASSPHRASE QR", wallet.passphrase);
  }
  
  console.log("Bitcoin address:");
  console.log(wallet.address);

  console.log("");
  console.log("WARNING");
  console.log("-------");
  console.log("Your mnemonic and passphrase control this wallet.");
  console.log("Never share them with anyone.");
  console.log("Store recovery information offline.");
  console.log("");
}

async function runValidate(): Promise<void> {
  const rl = createInterface({ input, output });

  try {
    const mnemonic = await rl.question("Enter BIP-39 mnemonic: ");

    if (!validateMnemonic(mnemonic.trim())) {
      console.error("Invalid BIP-39 mnemonic.");
      process.exitCode = 1;
      return;
    }

    const passphrase = await rl.question(
      "Enter BIP-39 passphrase (leave empty if none): ",
    );

    const address = deriveBitcoinAddress(
      mnemonic.trim(),
      passphrase,
    );

    console.log("");
    console.log("Valid BIP-39 mnemonic.");
    console.log(`BIP-84 address: ${address}`);
    console.log("");
  } finally {
    rl.close();
  }
}

async function runBalance(address: string | undefined): Promise<void> {
  if (!address || !isBitcoinAddress(address)) {
    throw new Error(
      "Usage: nkamoto balance <bc1... Bitcoin address>",
    );
  }

  const provider = new EsploraBalanceProvider();
  const balance = await provider.getBalance(address);

  console.log("");
  console.log(`Address:     ${balance.address}`);
  console.log(`Confirmed:   ${satoshisToBtc(balance.confirmedSatoshis)} BTC`);
  console.log(`Unconfirmed: ${satoshisToBtc(balance.unconfirmedSatoshis)} BTC`);
  console.log(`Total:       ${satoshisToBtc(balance.totalSatoshis)} BTC`);
  console.log("");
}

async function printQr(label: string, value: string): Promise<void> {
  console.log("");
  console.log(label);
  console.log("");
  console.log(await renderQr(value));
}

async function main(argv: string[]): Promise<void> {
  const [command, ...args] = argv;

  if (!command || command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "--version" || command === "-v" || command === "version") {
    printVersion();
    return;
  }

  switch (command) {
    case "qr":
      if (args.length > 0) {
        throw new Error("qr does not accept arguments");
      }
      await runGenerate(true);
      return;
    case "generate":
      if (args.length > 0) {
        throw new Error("generate does not accept arguments");
      }
      await runGenerate(false);
      return;

    case "validate":
      if (args.length > 0) {
        throw new Error(
          "validate reads the mnemonic interactively; do not pass secrets as arguments",
        );
      }
      await runValidate();
      return;

    case "balance":
      await runBalance(args[0]);
      return;

    default:
      printHelp();
      throw new Error(`Unknown command: ${command}`);
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`nkamoto: ${message}`);
  process.exitCode = 1;
});
