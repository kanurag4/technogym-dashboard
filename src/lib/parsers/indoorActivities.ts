import type { RawIndoorActivity } from '../../types/raw';
import type { Activity, ActivityType, ExerciseSet } from '../../types/domain';
import { parseMetricPairs } from '../utils';
import { labelExercise } from '../exerciseMap';

function detectType(metrics: Record<string, number>, sets: ExerciseSet[]): ActivityType {
  if ('RowingDistance' in metrics || 'AvgSpm' in metrics || 'RowingSplit' in metrics) {
    return 'rowing';
  }
  if (sets.some((s) => 'IsoWeight' in s.metrics || s.weightKg !== undefined)) {
    return 'strength';
  }
  return 'cardio';
}

function autoLabel(phId: string, metrics: Record<string, number>): string {
  // Check user-set or static map first
  const mapped = labelExercise(phId);
  if (!mapped.startsWith('Exercise ')) return mapped;

  // Auto-detect from metric fingerprint
  if ('TotalIsoWeight' in metrics || 'IsoWeight' in metrics) {
    const weight = metrics['TotalIsoWeight'] ?? metrics['IsoWeight'];
    return `Strength (~${Math.round(weight / (metrics['IsoReps'] ?? 1))}kg)`;
  }
  if ('AvgRunningCadence' in metrics || ('HDistance' in metrics && 'AvgPace' in metrics && 'Vo2' in metrics)) {
    return 'Treadmill';
  }
  if ('RowingSplit' in metrics && 'AvgSpm' in metrics && 'AvgPower' in metrics) {
    return 'Rowing (High Intensity)';
  }
  if ('RowingDistance' in metrics && !('AvgPower' in metrics) && !('AvgSpm' in metrics)) {
    return 'Rowing';
  }
  if ('RowingDistance' in metrics) {
    return 'Rowing';
  }

  return mapped;
}

export function parseIndoorActivities(raw: RawIndoorActivity[]): Activity[] {
  return raw
    .map((r) => {
      const metrics = parseMetricPairs(r.performedData.pr);
      const activityLabel = autoLabel(r.phId ?? '', metrics);

      const sets: ExerciseSet[] = (r.performedData.st ?? []).map((seg) => {
        const segMetrics = parseMetricPairs(seg.pr);
        const phId = seg.phId ?? r.phId ?? 'unknown';
        return {
          phId,
          exerciseLabel: autoLabel(phId, { ...metrics, ...segMetrics }),
          reps: segMetrics['IsoReps'],
          weightKg: segMetrics['IsoWeight'],
          durationSec: segMetrics['Duration'],
          restTimeSec: segMetrics['RestTime'],
          metrics: segMetrics,
        };
      });

      const type = detectType(metrics, sets);

      return {
        id: r.id,
        date: new Date(r.on),
        type,
        sourceType: 'indoor' as const,
        activityName: activityLabel,
        durationSec: metrics['Duration'],
        calories: metrics['Calories'] ?? metrics['CaloriesConsumption'],
        distanceM: metrics['RowingDistance'],
        metrics,
        sets: sets.length > 0 ? sets : undefined,
      };
    })
    .filter((a) => !isNaN(a.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
