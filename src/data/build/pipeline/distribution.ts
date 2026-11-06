import {
  interquartileRange,
  kernelDensityEstimation,
  sampleStandardDeviation,
} from "simple-statistics";

import type {
  ScoreDistribution,
  ParsedParticipation,
  StatusThresholds,
  ThresholdKey,
} from "@/data/types";
import {
  type EventMeta,
  ParticipationStatus,
  WinnerDegree,
} from "@/data/types/base";
import { getParticipationGroupKey } from "@/lib/group";
import { groupBy } from "@/lib/utils";

const POINT_BUDGET = 200;

const BANDWIDTH_STIFFNESS = 0.5;

function computeBandwidth(scores: number[]): number {
  const iqr = interquartileRange(scores);
  const deviation = sampleStandardDeviation(scores);
  const s = iqr > 0 ? Math.min(deviation, iqr / 1.34) : deviation;
  return 1.06 * s * Math.pow(scores.length, -0.2) * BANDWIDTH_STIFFNESS;
}

function computeThresholds(
  participations: ParsedParticipation[],
): StatusThresholds {
  const passingScores = new Map<ThresholdKey, number>();

  for (const participation of participations) {
    const key = participation.winnerDegree ?? participation.status;
    if (key == WinnerDegree.NONE || key == ParticipationStatus.FINALIST) {
      continue;
    }

    passingScores.set(
      key,
      Math.min(passingScores.get(key) ?? Infinity, participation.score),
    );
  }

  const thresholds: StatusThresholds = {};
  for (const [key, score] of passingScores) {
    const floored = Math.floor(score);
    const canUseFloored = !participations.some(
      (p) => p.score >= floored && p.score < score,
    );
    thresholds[key] = canUseFloored ? floored : score;
  }

  return thresholds;
}

export function calculateDistributions(
  participations: ParsedParticipation[],
  meta: EventMeta,
): Record<string, ScoreDistribution> {
  const groups = groupBy(participations, (participation) =>
    getParticipationGroupKey(meta.percentileRanking, participation),
  );

  const result: Record<string, ScoreDistribution> = {};

  for (const [key, entries] of groups) {
    if (key == null) {
      continue;
    }

    const scores = entries.map((entry) => entry.score);
    if (new Set(scores).size < 2) {
      // stddev/IQR are both 0 -> KDE bandwidth is 0 -> density() divides by zero.
      continue;
    }

    const density = kernelDensityEstimation(
      scores,
      undefined,
      computeBandwidth(scores),
    );

    const domainMax = meta.maxScore;
    const step = Math.max(1, Math.ceil(domainMax / POINT_BUDGET));

    const curve = [];
    for (let score = 0; score < domainMax; score += step) {
      curve.push({ score, density: density(score) });
    }

    curve.push({ score: domainMax, density: density(domainMax) });

    result[key] = { curve, thresholds: computeThresholds(entries) };
  }

  return result;
}
