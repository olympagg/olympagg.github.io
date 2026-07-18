import { WinnerDegree } from "@/data/types/base";
import { ProdTrack } from "@/data/types/prod";
import { pluralize } from "@/lib/utils";

const DEGREE_LABELS: Record<
  Exclude<WinnerDegree, WinnerDegree.NONE>,
  string
> = {
  [WinnerDegree.FIRST]: "I степень",
  [WinnerDegree.SECOND]: "II степень",
  [WinnerDegree.THIRD]: "III степень",
};

export function formatWinnerDegree(degree?: WinnerDegree): string | null {
  return degree && degree !== WinnerDegree.NONE ? DEGREE_LABELS[degree] : null;
}

const PEOPLE_FORMS: [string, string, string] = [
  "человек",
  "человека",
  "человек",
];

export function pluralizePeople(count: number): string {
  return `${count} ${pluralize(count, PEOPLE_FORMS)}`;
}

export function extractFirstName(fullName: string): string {
  return fullName.split(" ")[1] ?? fullName;
}

export function formatShortName(fullName: string): string {
  const parts = fullName.split(" ");
  return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : fullName;
}

export function formatRcsoLevel(level?: 1 | 2 | 3): string {
  return level ? ["I", "II", "III"][level - 1]! : "—";
}

export function formatTrackName(track: ProdTrack): string {
  switch (track) {
    case ProdTrack.BACKEND:
      return "Бэкенд";
    case ProdTrack.FRONTEND:
      return "Фронтенд";
    case ProdTrack.MOBILE:
      return "Мобильная разработка";
    case ProdTrack.MLOPS:
      return "MLOps-инжиниринг";
    default:
      return track;
  }
}

export function formatShortTrackName(track: ProdTrack): string {
  switch (track) {
    case ProdTrack.BACKEND:
      return "Бэкенд";
    case ProdTrack.FRONTEND:
      return "Фронтенд";
    case ProdTrack.MOBILE:
      return "Мобилка";
    case ProdTrack.MLOPS:
      return "MLOps";
    default:
      return track;
  }
}
