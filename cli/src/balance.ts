export interface BitcoinBalance {
  readonly address: string;
  readonly confirmedSatoshis: bigint;
  readonly unconfirmedSatoshis: bigint;
  readonly totalSatoshis: bigint;
}

export interface BitcoinBalanceProvider {
  getBalance(address: string): Promise<BitcoinBalance>;
}

export class EsploraBalanceProvider implements BitcoinBalanceProvider {
  public constructor(
    private readonly baseUrl = "https://blockstream.info/api",
  ) {}

  public async getBalance(address: string): Promise<BitcoinBalance> {
    if (!isBitcoinAddress(address)) {
      throw new Error("Invalid Bitcoin address");
    }

    const response = await fetch(
      `${this.baseUrl.replace(/\/$/, "")}/address/${encodeURIComponent(address)}`,
      {
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Bitcoin balance request failed with HTTP ${response.status}`,
      );
    }

    const data: unknown = await response.json();
    const stats = parseAddressStats(data);

    const confirmedSatoshis =
      stats.chainStats.funded - stats.chainStats.spent;
    const unconfirmedSatoshis =
      stats.mempoolStats.funded - stats.mempoolStats.spent;

    return {
      address,
      confirmedSatoshis,
      unconfirmedSatoshis,
      totalSatoshis: confirmedSatoshis + unconfirmedSatoshis,
    };
  }
}

function parseAddressStats(value: unknown): AddressStats {
  if (!isRecord(value)) {
    throw new Error("Invalid Bitcoin API response");
  }

  const chainStats = parseStats(value.chain_stats);
  const mempoolStats = parseStats(value.mempool_stats);

  return { chainStats, mempoolStats };
}

interface AddressStats {
  chainStats: Stats;
  mempoolStats: Stats;
}

interface Stats {
  funded: bigint;
  spent: bigint;
}

function parseStats(value: unknown): Stats {
  if (!isRecord(value)) {
    throw new Error("Invalid Bitcoin API response");
  }

  return {
    funded: parseNonNegativeInteger(value.funded_txo_sum),
    spent: parseNonNegativeInteger(value.spent_txo_sum),
  };
}

function parseNonNegativeInteger(value: unknown): bigint {
  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error("Invalid Bitcoin API response");
  }

  const text = String(value);

  if (!/^\d+$/.test(text)) {
    throw new Error("Invalid Bitcoin API response");
  }

  return BigInt(text);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isBitcoinAddress(address: string): boolean {
  return /^bc1[ac-hj-np-z02-9]{11,87}$/.test(address);
}

export function satoshisToBtc(satoshis: bigint): string {
  const whole = satoshis / 100_000_000n;
  const fraction = (satoshis % 100_000_000n)
    .toString()
    .padStart(8, "0")
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : `${whole}.00000000`;
}
