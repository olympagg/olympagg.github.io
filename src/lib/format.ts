import { ParticipationStatus, WinnerDegree } from "@/data/types/base";
import { ProdTrack } from "@/data/types/prod";
import type { RcsoLevel } from "@/data/types/rcso";
import { pluralize } from "@/lib/utils";

const DEGREE_LABELS: Record<
  Exclude<WinnerDegree, WinnerDegree.NONE>,
  string
> = {
  [WinnerDegree.FIRST]: "I степень",
  [WinnerDegree.SECOND]: "II степень",
  [WinnerDegree.THIRD]: "III степень",
};

export const STATUS_LABELS: Record<ParticipationStatus, string> = {
  [ParticipationStatus.WINNER]: "Победитель",
  [ParticipationStatus.PRIZE_WINNER]: "Призер",
  [ParticipationStatus.FINALIST]: "Участник",
};

const PEOPLE_FORMS: [string, string, string] = [
  "человек",
  "человека",
  "человек",
];

export function normalizeWinnerDegree(
  degree?: WinnerDegree,
): Exclude<WinnerDegree, WinnerDegree.NONE> | undefined {
  return degree && degree !== WinnerDegree.NONE ? degree : undefined;
}

export function formatWinnerDegree(degree?: WinnerDegree): string | null {
  const normalized = normalizeWinnerDegree(degree);
  return normalized ? DEGREE_LABELS[normalized] : null;
}

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

export function formatRcsoLevel(level?: RcsoLevel): string {
  return level ? ["I", "II", "III"][level - 1]! : "—";
}

export function formatAcademicYear(year: number): string {
  return `${year}/${String(year + 1).slice(-2)}`;
}

export function extractDomain(url: string): string {
  const withoutScheme = url.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  const host = withoutScheme.split(/[/?#]/)[0] ?? withoutScheme;
  return host.replace(/^www\./i, "");
}

export function formatSubjects(subjects: string[], max = 1): string {
  if (subjects.length <= max) {
    return subjects.join(", ");
  }

  return `${subjects.slice(0, max).join(", ")} и ещё ${subjects.length - max}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
