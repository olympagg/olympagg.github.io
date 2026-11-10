import type { EventData, Participation } from "@/data/types";
import type { EventId, FullName } from "@/data/types/base";

export function buildParticipationsData(
  eventsData: Map<EventId, EventData>,
): Map<EventId, Map<FullName, Participation>> {
  const participationsData = new Map<EventId, Map<FullName, Participation>>();

  for (const [eventId, event] of eventsData) {
    const participationsMap = new Map<FullName, Participation>();
    for (const participation of event.participations) {
      participationsMap.set(participation.fullName, participation);
    }
    participationsData.set(eventId, participationsMap);
  }

  return participationsData;
}
