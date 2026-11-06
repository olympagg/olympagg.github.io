import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function pluralize(
  count: number,
  forms: [string, string, string],
): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 > 10 && mod100 < 20) {
    return forms[2];
  }
  if (mod10 === 1) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }
  return forms[2];
}

export function formatDate(date: Date): string {
  return date
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/ г\.$/, "");
}

export function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatNumber(num: number): string {
  return round(num, 1).toString();
}

export function formatOptionalNumber(value: number | null | undefined): string {
  return value == null ? "—" : formatNumber(value);
}

export function formatPercent(value: number): string {
  return `${formatNumber(value)}%`;
}

export function groupBy<T, K>(
  items: Iterable<T>,
  keyFunction: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();

  for (const item of items) {
    const key = keyFunction(item);
    const group = map.get(key);

    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return map;
}

export function sorted<T>(
  items: Iterable<T>,
  keyFunction: (item: T) => number | string,
): T[] {
  return [...items].sort((a, b) => {
    const ka = keyFunction(a);
    const kb = keyFunction(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

export function range(start: number, stop: number): number[] {
  return Array.from({ length: stop - start }, (_, index) => index + start);
}

export function compareStrings(a: string | null, b: string | null): number {
  if (a === b) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  return a.localeCompare(b, "ru");
}

export function compareNullableNumbers(
  a: number | null,
  b: number | null,
): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  return a - b;
}
