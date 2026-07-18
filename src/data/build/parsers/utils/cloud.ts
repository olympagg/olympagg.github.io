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

async function resolveYandexUrl(url: string): Promise<string> {
  const parsed = parseYandexDisk(url);
  if (!parsed) {
    throw new Error(`Unsupported cloud storage URL: ${url}`);
  }

  const apiUrl =
    `${YANDEX_DISK_API}?public_key=${encodeURIComponent(parsed.publicKey)}` +
    (parsed.path ? `&path=${encodeURIComponent(parsed.path)}` : "");

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to resolve Yandex URL: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { href: string };
  return data.href;
}

export function isCloudStorageUrl(url: string): boolean {
  return parseYandexDisk(url) !== null;
}

export async function resolveCloudStorageUrl(url: string): Promise<string> {
  return resolveYandexUrl(url);
}
