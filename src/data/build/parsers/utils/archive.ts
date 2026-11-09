const WAYBACK_HOST = "web.archive.org";

// `id_` makes Wayback serve the original bytes, without its toolbar and rewritten links
export function wayback(url: string, timestamp: string): string {
  return `https://${WAYBACK_HOST}/web/${timestamp}id_/${url}`;
}
