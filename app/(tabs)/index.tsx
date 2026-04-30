import { ScrollView, View, Text } from 'react-native';
import { useAppStore } from '../../src/store/appStore';
import { StatCard } from '../../src/components/ui/StatCard';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { FilterBar } from '../../src/components/filters/FilterBar';
import { WorkoutFrequencyChart } from '../../src/components/charts/WorkoutFrequencyChart';
import { ActivityTypeBreakdown } from '../../src/components/charts/ActivityTypeBreakdown';
import { useFilteredActivities } from '../../src/hooks/useFilteredData';

function OverviewStats() {
  const { data } = useAppStore();
  const activities = useFilteredActivities();

  if (!data) return null;

  const totalCalories = activities.reduce((s, a) => s + (a.calories ?? 0), 0);
  const latestWeight = [...data.biometrics].filter((b) => b.metric === 'Weight').pop();

  return (
    <View className="flex-row mb-4">
      <StatCard label="Sessions" value={activities.length} color="#3b82f6" />
      <StatCard label="Calories" value={Math.round(totalCalories).toLocaleString()} unit="kcal" color="#10b981" />
      {latestWeight && (
        <StatCard label="Weight" value={latestWeight.value.toFixed(1)} unit="kg" color="#f59e0b" />
      )}
    </View>
  );
}

export default function OverviewScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-900" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <FilterBar showTypes showGranularity />
      <OverviewStats />

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Workout Frequency" subtitle="Sessions per period" />
        <WorkoutFrequencyChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Activity Breakdown" subtitle="Calories burned by type" />
        <ActivityTypeBreakdown />
      </View>
    </ScrollView>
  );
}
