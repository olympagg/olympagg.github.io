import { extname, join } from "node:path";

import pRetry from "p-retry";

import { PROXY_DOMAINS, PROXY_URL } from "@/env";

import { isCloudStorageUrl, resolveCloudStorageUrl } from "./cloud";

const CACHE_DATA_DIR = join(import.meta.dir, "..", "..", "..", "cache");
const REQUEST_TIMEOUT = 10_000;

const unavailableUrls = new Set<string>();

function getCacheFileName(url: string) {
  const cacheKey = Bun.hash.xxHash3(url).toString(16);

  try {
    const extension = extname(new URL(url).pathname);
    return extension ? `${cacheKey}${extension}` : cacheKey;
  } catch {
    return cacheKey;
  }
}

export async function getFromCache(url: string): Promise<ArrayBuffer | null> {
  const path = join(CACHE_DATA_DIR, getCacheFileName(url));
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return null;
  }

  return await file.arrayBuffer();
}

export async function storeInCache(
  url: string,
  buffer: ArrayBuffer,
): Promise<void> {
  const path = join(CACHE_DATA_DIR, getCacheFileName(url));
  await Bun.write(path, buffer);
}

function resolveProxy(url: string): string | undefined {
  if (!PROXY_URL || PROXY_DOMAINS.length === 0) {
    return undefined;
  }

  const { hostname } = new URL(url);
  return PROXY_DOMAINS.some((domain) => hostname === domain)
    ? PROXY_URL
    : undefined;
}

async function tryFetchBuffer(
  url: string,
  options?: BunFetchRequestInit,
): Promise<ArrayBuffer> {
  const response = await fetch(url, options);
  if (!response.ok) {
    console.error(
      `[fetch] Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.arrayBuffer();
}

export async function fetchBuffer(
  url: string,
  options?: BunFetchRequestInit,
): Promise<ArrayBuffer> {
  const isGet = (options?.method ?? "GET").toUpperCase() === "GET";

  if (isGet || unavailableUrls.has(url)) {
    const cached = await getFromCache(url);
    if (cached) {
      return cached;
    }
  }

  const fetchUrl = isCloudStorageUrl(url)
    ? await resolveCloudStorageUrl(url)
    : url;

  const proxy = resolveProxy(fetchUrl);

  try {
    const buffer = await pRetry(
      async () => {
        return await tryFetchBuffer(fetchUrl, {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT),
          proxy,
          ...options,
        });
      },
      { retries: 3 },
    );

    await storeInCache(url, buffer);
    return buffer;
  } catch (error) {
    unavailableUrls.add(url);

    if (!isGet) {
      const cached = await getFromCache(url);
      if (cached) {
        return cached;
      }
    }

    throw error;
  }
}
