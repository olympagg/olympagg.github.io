import { fetchBuffer } from "./fetch";

export async function loadJson<T>(url: string): Promise<T> {
  const buffer = await fetchBuffer(url);
  return JSON.parse(new TextDecoder().decode(buffer)) as T;
}
