const SITE_NAME = "Olympiad Aggregator";

export function pageTitle(name?: string): string {
  return name ? `${name} — ${SITE_NAME}` : SITE_NAME;
}
