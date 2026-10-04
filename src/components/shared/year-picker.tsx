import { SegmentedPicker } from "@/components/shared/segmented-picker";
import { formatAcademicYear } from "@/lib/format";

export function YearPicker({
  years,
  selected,
  onSelect,
  className,
}: {
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
  className?: string;
}) {
  const options = [...years]
    .sort((a, b) => b - a)
    .map((year) => ({ value: year, label: formatAcademicYear(year) }));

  return (
    <SegmentedPicker
      options={options}
      value={selected}
      onSelect={onSelect}
      className={className}
    />
  );
}
