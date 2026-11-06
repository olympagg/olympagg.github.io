import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  DistributionPoint,
  EventData,
  StatusThresholds,
  Participation,
  ThresholdKey,
} from "@/data/types";
import { ParticipationStatus, WinnerDegree } from "@/data/types/base";
import {
  extractFirstName,
  formatWinnerDegree,
  STATUS_LABELS,
} from "@/lib/format";
import { formatGroupContext, getParticipationGroupKey } from "@/lib/group";
import { formatNumber } from "@/lib/utils";

const GOLD = "var(--gold)";
const SILVER = "var(--silver)";
const BRONZE = "var(--bronze)";

const DEGREE_COLORS: Record<
  Exclude<WinnerDegree, WinnerDegree.NONE>,
  string
> = {
  [WinnerDegree.FIRST]: GOLD,
  [WinnerDegree.SECOND]: SILVER,
  [WinnerDegree.THIRD]: BRONZE,
};

const STATUS_COLORS: Record<
  Exclude<ParticipationStatus, ParticipationStatus.FINALIST>,
  string
> = {
  [ParticipationStatus.WINNER]: GOLD,
  [ParticipationStatus.PRIZE_WINNER]: SILVER,
};

function isWinnerDegree(
  key: ThresholdKey,
): key is Exclude<WinnerDegree, WinnerDegree.NONE> {
  return key in DEGREE_COLORS;
}

function buildThresholdItems(thresholds: StatusThresholds): MarkerItem[] {
  return Object.entries(thresholds).map(([entryKey, score]) => {
    const key = entryKey as ThresholdKey;
    return isWinnerDegree(key)
      ? {
          key,
          score,
          label: formatWinnerDegree(key) ?? key,
          color: DEGREE_COLORS[key],
        }
      : { key, score, label: STATUS_LABELS[key], color: STATUS_COLORS[key] };
  });
}

const chartConfig = {
  density: { label: "Плотность", color: "var(--color-foreground)" },
} satisfies ChartConfig;

interface MarkerItem {
  key: string;
  score: number;
  label: string;
  color: string;
}

interface ScoreDistributionChartProps {
  event: EventData;
  participation: Participation;
}

function bracketingPoints(
  curve: DistributionPoint[],
  target: number,
): DistributionPoint[] {
  for (const [index, point] of curve.entries()) {
    if (point.score === target) {
      return [point];
    }

    const previous = curve[index - 1];
    if (previous && previous.score < target && target < point.score) {
      return [previous, point];
    }
  }

  return [target < curve[0]!.score ? curve[0]! : curve[curve.length - 1]!];
}

function ScoreTooltip({
  active,
  payload,
  markersByPoint,
}: TooltipContentProps & {
  markersByPoint: Map<DistributionPoint, MarkerItem[]>;
}) {
  const point = payload[0]?.payload as DistributionPoint | undefined;
  if (!active || !point) {
    return null;
  }

  const markers = markersByPoint.get(point) ?? [];

  return (
    <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">Балл: {formatNumber(point.score)}</div>
      {markers.map((marker) => (
        <div
          key={marker.key}
          className="mt-1 flex items-center gap-1.5"
          style={{ color: marker.color }}
        >
          <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ backgroundColor: marker.color }}
          />
          {marker.label}: {formatNumber(marker.score)}
        </div>
      ))}
    </div>
  );
}

export function ScoreDistributionChart({
  event,
  participation,
}: ScoreDistributionChartProps) {
  const groupKey = getParticipationGroupKey(
    event.meta.percentileRanking,
    participation,
  );
  const distribution = groupKey ? event.distributions?.[groupKey] : undefined;

  if (!distribution) {
    return null;
  }

  const { curve, thresholds } = distribution;
  const firstName = extractFirstName(participation.fullName);
  const groupContext = formatGroupContext(
    event.meta.percentileRanking,
    participation,
  );
  const title = groupContext
    ? `Распределение баллов ${groupContext}`
    : "Распределение баллов";

  const thresholdItems = buildThresholdItems(thresholds);
  const markers = [
    {
      key: "me",
      score: participation.score,
      label: firstName,
      color: "var(--color-foreground)",
    },
    ...thresholdItems,
  ];

  const markersByPoint = new Map<DistributionPoint, MarkerItem[]>();
  for (const marker of markers) {
    for (const point of bracketingPoints(curve, marker.score)) {
      const existing = markersByPoint.get(point);
      if (existing) {
        existing.push(marker);
      } else {
        markersByPoint.set(point, [marker]);
      }
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <div className="rounded-lg border p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-56 w-full"
        >
          <AreaChart
            data={curve}
            margin={{ top: 20, right: 12, left: 12, bottom: 4 }}
          >
            <XAxis
              dataKey="score"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatNumber}
            />
            {}
            <YAxis hide domain={[0, (dataMax: number) => dataMax * 1.05]} />
            <ChartTooltip
              position={{ y: 0 }}
              content={(props) => (
                <ScoreTooltip {...props} markersByPoint={markersByPoint} />
              )}
            />
            <Area
              dataKey="density"
              type="monotone"
              fill="var(--color-density)"
              fillOpacity={0.15}
              stroke="var(--color-density)"
            />
            {thresholdItems.map((item) => (
              <ReferenceLine
                key={item.key}
                x={item.score}
                stroke={item.color}
                strokeWidth={1.5}
                pathLength={60}
                strokeDasharray="2 1"
              />
            ))}
            <ReferenceLine
              x={participation.score}
              stroke="var(--color-foreground)"
              strokeWidth={2}
              label={{
                value: firstName,
                position: "top",
                fill: "var(--color-foreground)",
                fontSize: 11,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
