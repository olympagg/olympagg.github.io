import {
  JULY_MONTH_INDEX,
  MAX_SCHOOL_GRADE,
  SEPTEMBER_MONTH_INDEX,
} from "./constants";

export function getAcademicYear(date: Date): number {
  return date.getMonth() >= SEPTEMBER_MONTH_INDEX
    ? date.getFullYear()
    : date.getFullYear() - 1;
}

export function getAcademicYearEnd(date: Date = new Date()): number {
  return getAcademicYear(date) + 1;
}

export function getGraduationLabel(
  graduationYear: number | null,
): string | null {
  if (graduationYear == null) {
    return null;
  }

  const today = new Date();
  const graduationDate = new Date(graduationYear, JULY_MONTH_INDEX, 1);
  if (today >= graduationDate) {
    return `Выпуск ${graduationYear} года`;
  }

  const currentClass =
    MAX_SCHOOL_GRADE - (graduationYear - getAcademicYearEnd());
  if (currentClass < 1 || currentClass > MAX_SCHOOL_GRADE) {
    return null;
  }

  return `В ${currentClass} классе`;
}
