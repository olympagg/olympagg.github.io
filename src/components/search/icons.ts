import {
  CalendarDays,
  GraduationCap,
  MapPinned,
  School as SchoolIcon,
  Users,
} from "lucide-react";

import type { SearchResult } from "@/data/runtime/search";

export const RESULT_ICONS = {
  event: CalendarDays,
  person: GraduationCap,
  team: Users,
  school: SchoolIcon,
  region: MapPinned,
} as const satisfies Record<SearchResult["type"], unknown>;
