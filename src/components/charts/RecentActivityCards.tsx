import { View, Text } from 'react-native';
import { useFilteredActivities } from '../../hooks/useFilteredData';
import { secToMin, mToKm } from '../../lib/utils';
import type { Activity } from '../../types/domain';

const TYPE_ICONS: Record<string, string> = {
  strength: '🏋️',
  cardio: '🏃',
  rowing: '🚣',
  outdoor: '🌿',
};

const TYPE_COLORS: Record<string, string> = {
  strength: '#3b82f6',
  cardio: '#10b981',
  rowing: '#f59e0b',
  outdoor: '#8b5cf6',
};

function formatDuration(sec?: number): string {
  if (!sec) return '–';
  const m = secToMin(sec);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

function ActivityCard({ activity }: { activity: Activity }) {
  const color = TYPE_COLORS[activity.type] ?? '#6b7280';
  const icon = TYPE_ICONS[activity.type] ?? '💪';

  return (
    <View className="bg-gray-700 rounded-xl p-3 mb-2 flex-row items-center">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${color}30` }}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-100 capitalize">
          {activity.activityName ?? activity.type}
        </Text>
        <Text className="text-xs text-gray-500">
          {activity.date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>
      <View className="items-end gap-0.5">
        {activity.durationSec && (
          <Text className="text-xs font-medium text-gray-300">
            ⏱ {formatDuration(activity.durationSec)}
          </Text>
        )}
        {activity.calories && (
          <Text className="text-xs text-gray-500">{Math.round(activity.calories)} cal</Text>
        )}
        {activity.distanceM && activity.distanceM > 0 && (
          <Text className="text-xs text-gray-500">{mToKm(activity.distanceM)} km</Text>
        )}
      </View>
    </View>
  );
}

export function RecentActivityCards() {
  const activities = useFilteredActivities();
  const recent = activities.slice(0, 10);

  if (recent.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No activities found</Text>
      </View>
    );
  }

  return (
    <View>
      {recent.map((a) => (
        <ActivityCard key={a.id} activity={a} />
      ))}
    </View>
  );
}
