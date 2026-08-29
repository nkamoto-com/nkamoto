# nkamoto

A terminal Bitcoin wallet CLI built around BIP-39 and BIP-84.

> **Security status:** development release. Do not use this implementation to store real BTC until it has been independently reviewed and audited.

## Requirements

- Node.js 20.19+.
- npm.

## Commands

Running `nkamoto` without a command displays help.

```text
nkamoto
nkamoto generate
nkamoto validate
nkamoto balance <bc1...>
nkamoto --help
nkamoto --version
```

### `nkamoto generate`

Generates:

- 256 bits of cryptographically secure entropy.
- A 24-word BIP-39 English mnemonic.
- A separately generated 12-word BIP-39 passphrase.
- A Bitcoin mainnet BIP-84 native SegWit address.
- Terminal QR codes for the mnemonic and passphrase.

Derivation path:

```text
m/84'/0'/0'/0/0
```

### `nkamoto validate`

Reads the mnemonic interactively rather than accepting it as a command-line argument, reducing the chance of shell-history leakage.

```text
nkamoto validate
```

It validates the BIP-39 checksum, accepts the optional BIP-39 passphrase interactively, and derives the first BIP-84 address.

### `nkamoto balance`

Checks a public Bitcoin address using the Blockstream Esplora API.

```text
nkamoto balance bc1q...
```

Only the public address is sent to the balance service. The command does not accept or require a mnemonic or private key.

The provider is isolated behind `BitcoinBalanceProvider` so a self-hosted or alternative backend can be added later.

## Development

```bash
npm install
npm run lint
npm test
npm run build
npm start
```

For direct development:

```bash
npm run dev
```

## Security

The mnemonic and BIP-39 passphrase are recovery secrets.

Do not:

- put them in shell arguments;
- paste them into websites or chat;
- commit them to source control;
- redirect wallet-generation output to files;
- use generated wallets with real funds before independent security review.

The public API intentionally does not return the derived BIP-39 seed.

## License

MIT
