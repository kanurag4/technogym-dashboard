import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAppStore, toggleActivityType } from '../../store/appStore';
import type { ActivityType } from '../../types/domain';

const PRESETS: Array<{ label: string; days: number | null }> = [
  { label: '30d', days: 30 },
  { label: '3m', days: 90 },
  { label: '6m', days: 180 },
  { label: '1y', days: 365 },
  { label: 'All', days: null },
];

const ACTIVITY_TYPES: ActivityType[] = ['strength', 'cardio', 'rowing', 'outdoor'];

const TYPE_COLORS: Record<ActivityType, string> = {
  strength: '#3b82f6',
  cardio: '#10b981',
  rowing: '#f59e0b',
  outdoor: '#8b5cf6',
};

interface FilterBarProps {
  showTypes?: boolean;
  showGranularity?: boolean;
}

export function FilterBar({ showTypes = true, showGranularity = true }: FilterBarProps) {
  const { filters, setFilter } = useAppStore();

  function applyPreset(days: number | null) {
    if (days === null) {
      setFilter('dateFrom', null);
      setFilter('dateTo', null);
    } else {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - days);
      setFilter('dateFrom', from);
      setFilter('dateTo', to);
    }
  }

  function isPresetActive(days: number | null): boolean {
    if (days === null) return filters.dateFrom === null && filters.dateTo === null;
    if (!filters.dateFrom || !filters.dateTo) return false;
    const diff = Math.round(
      (filters.dateTo.getTime() - filters.dateFrom.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.abs(diff - days) <= 1;
  }

  return (
    <View className="bg-gray-800 rounded-2xl p-3 mb-4">
      <View className="flex-row gap-2 mb-2">
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            onPress={() => applyPreset(p.days)}
            className={`px-3 py-1 rounded-full flex-1 items-center ${
              isPresetActive(p.days) ? 'bg-blue-500' : 'bg-gray-700'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isPresetActive(p.days) ? 'text-white' : 'text-gray-400'
              }`}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showTypes && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
        >
          {ACTIVITY_TYPES.map((type) => {
            const active = filters.activityTypes.includes(type);
            return (
              <TouchableOpacity
                key={type}
                onPress={() =>
                  setFilter('activityTypes', toggleActivityType(filters.activityTypes, type))
                }
                className={`px-3 py-1 rounded-full border ${active ? '' : 'border-gray-600 bg-gray-700'}`}
                style={active ? { backgroundColor: TYPE_COLORS[type], borderColor: TYPE_COLORS[type] } : {}}
              >
                <Text className={`text-xs font-medium capitalize ${active ? 'text-white' : 'text-gray-400'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {showGranularity && (
        <View className="flex-row mt-2 bg-gray-700 rounded-full p-0.5">
          {(['weekly', 'monthly'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setFilter('granularity', g)}
              className={`flex-1 py-1 rounded-full items-center ${
                filters.granularity === g ? 'bg-gray-900' : ''
              }`}
            >
              <Text
                className={`text-xs font-medium capitalize ${
                  filters.granularity === g ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
