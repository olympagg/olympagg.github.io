import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import slugify from "@sindresorhus/slugify";

import type { Slug } from "@/data/types/base";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const HASH_WIDTH = 43;

const HASH_LEN = 8;
const SLUG_MAX_LEN = 20;

function bytesToBase62(bytes: Uint8Array): string {
  let n = 0n;
  for (const byte of bytes) {
    n = (n << 8n) | BigInt(byte);
  }

  let out = "";
  while (n > 0n) {
    out = BASE62.charAt(Number(n % 62n)) + out;
    n /= 62n;
  }

  return out.padStart(HASH_WIDTH, "0");
}

function slugPart(text: string): string {
  const firstTwoWords = text.trim().split(/\s+/).slice(0, 2).join(" ");
  const slug = slugify(firstTwoWords, { separator: "_", lowercase: true });
  return slug.slice(0, SLUG_MAX_LEN).replace(/_+$/, "");
}

export function encodeSlug(text: string): Slug {
  const hash = bytesToBase62(sha256(utf8ToBytes(text))).slice(0, HASH_LEN);
  const slug = slugPart(text);
  return (slug ? `${hash}_${slug}` : hash) as Slug;
}
