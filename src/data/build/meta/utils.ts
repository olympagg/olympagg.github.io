import type { EventId, EventMeta } from "@/data/types/base";

export function expandMeta<
  const TBase extends Omit<Partial<EventMeta>, "id"> & { id: string },
  const TItem extends Partial<EventMeta> & { date: Date } & Omit<
      EventMeta,
      "id" | keyof TBase
    >,
>(base: TBase, items: TItem[]): (TBase & TItem & { id: EventId })[] {
  return items.map((item) => ({
    ...base,
    ...item,
    id: `${base.id}${item.date.getFullYear() % 100}` as EventId,
  }));
}
