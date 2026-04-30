import type { RawOutdoorActivity } from '../../types/raw';
import type { Activity } from '../../types/domain';
import { parseMetricPairs } from '../utils';

export function parseOutdoorActivities(raw: RawOutdoorActivity[]): Activity[] {
  return raw
    .map((r) => {
      const metrics = parseMetricPairs(r.physicalActivityData.pr);
      return {
        id: r.id,
        date: new Date(r.performedDate),
        type: 'outdoor' as const,
        sourceType: 'outdoor' as const,
        durationSec: metrics['Duration'],
        calories: metrics['Calories'],
        distanceM: metrics['HDistance'],
        metrics,
        activityName: r.activityName,
      };
    })
    .filter((a) => !isNaN(a.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
