import pRetry, { AbortError } from "p-retry";

const YANDEX_DISK_API =
  "https://cloud-api.yandex.net/v1/disk/public/resources/download";

const YA_DISK_PUBLIC_RE = /^ya-disk-public:\/\/(.+):\/(.+)$/;

function parseYandexDisk(url: string): {
  publicKey: string;
  path?: string;
} | null {
  const parsed = new URL(url);

  if (
    parsed.hostname.startsWith("disk.yandex.") ||
    parsed.hostname.startsWith("disk.360.yandex.")
  ) {
    return { publicKey: url };
  }

  if (
    !parsed.hostname.startsWith("docviewer.yandex.") &&
    !parsed.hostname.startsWith("docs.yandex.")
  ) {
    return null;
  }

  const innerUrl = parsed.searchParams.get("url");
  if (!innerUrl) {
    throw new Error(`No inner url found: ${url}`);
  }

  const match = YA_DISK_PUBLIC_RE.exec(innerUrl);
  if (!match) {
    throw new Error(`Invalid innerUrl: ${innerUrl}`);
  }

  return {
    publicKey: match[1]!,
    path: `/${match[2]!}`,
  };
}

// Yandex Disk API answers 429 on bursts of requests
const API_REQUEST_INTERVAL = 2_000;

let nextApiRequestAt = 0;

async function fetchYandexApi(apiUrl: string): Promise<Response> {
  const now = Date.now();
  const requestAt = Math.max(now, nextApiRequestAt);
  nextApiRequestAt = requestAt + API_REQUEST_INTERVAL;
  await Bun.sleep(requestAt - now);

  return fetch(apiUrl);
}

async function resolveYandexUrl(url: string): Promise<string> {
  const parsed = parseYandexDisk(url);
  if (!parsed) {
    throw new Error(`Unsupported cloud storage URL: ${url}`);
  }

  const apiUrl =
    `${YANDEX_DISK_API}?public_key=${encodeURIComponent(parsed.publicKey)}` +
    (parsed.path ? `&path=${encodeURIComponent(parsed.path)}` : "");

  return pRetry(
    async () => {
      const response = await fetchYandexApi(apiUrl);
      if (!response.ok) {
        const error = new Error(
          `Failed to resolve Yandex URL ${url}: ${response.status} ${response.statusText}`,
        );
        const isTransient = response.status === 429 || response.status >= 500;
        throw isTransient ? error : new AbortError(error);
      }

      const data = (await response.json()) as { href: string };
      return data.href;
    },
    { retries: 5, minTimeout: 5_000 },
  );
}

export function isCloudStorageUrl(url: string): boolean {
  return parseYandexDisk(url) !== null;
}

export async function resolveCloudStorageUrl(url: string): Promise<string> {
  return resolveYandexUrl(url);
}
