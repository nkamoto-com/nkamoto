import { randomInt } from "node:crypto";
import { wordlist } from "@scure/bip39/wordlists/english.js";

const DEFAULT_WORD_COUNT = 12;

export interface RandomWordSource {
  next(maxExclusive: number): number;
}

const cryptoWordSource: RandomWordSource = {
  next(maxExclusive: number): number {
    return randomInt(0, maxExclusive);
  },
};

export function generatePassphrase(
  wordCount = DEFAULT_WORD_COUNT,
  random: RandomWordSource = cryptoWordSource,
): string {
  if (!Number.isInteger(wordCount) || wordCount < 1) {
    throw new RangeError("wordCount must be a positive integer");
  }

  const words = Array.from({ length: wordCount }, () => {
    const index = random.next(wordlist.length);

    if (!Number.isInteger(index) || index < 0 || index >= wordlist.length) {
      throw new Error("Random source returned an invalid word index");
    }

    return wordlist[index];
  });

  return words.join(" ");
}
