# nkamoto development snapshot

## Version

0.2.0

## CLI

- `nkamoto` -> help
- `nkamoto generate`
- `nkamoto validate`
- `nkamoto balance <address>`
- `nkamoto --help`
- `nkamoto --version`

## Wallet

- Bitcoin mainnet
- BIP-39 English
- 256-bit entropy / 24-word mnemonic
- 12-word generated BIP-39 passphrase
- BIP-84 P2WPKH
- `m/84'/0'/0'/0/0`

## Balance

The balance command uses the Blockstream Esplora HTTP API through an isolated provider interface.

## Tests

The test suite covers BIP-39, BIP-84, QR rendering, balance formatting/address validation, and CLI behavior.
