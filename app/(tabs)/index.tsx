import { ScrollView, View, Text } from 'react-native';
import { useAppStore } from '../../src/store/appStore';
import { StatCard } from '../../src/components/ui/StatCard';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { FilterBar } from '../../src/components/filters/FilterBar';
import { WorkoutFrequencyChart } from '../../src/components/charts/WorkoutFrequencyChart';
import { ActivityTypeBreakdown } from '../../src/components/charts/ActivityTypeBreakdown';
import { TrainingLoadChart } from '../../src/components/charts/TrainingLoadChart';
import { MetsMinChart } from '../../src/components/charts/MetsMinChart';
import { useFilteredActivities } from '../../src/hooks/useFilteredData';
import { formatDate } from '../../src/lib/utils';

function OverviewStats() {
  const { data } = useAppStore();
  const activities = useFilteredActivities();

  if (!data) return null;

  const indoorActivities = activities.filter((a) => a.sourceType === 'indoor');
  const gymDays = [...new Set(indoorActivities.map((a) => formatDate(a.date)))];
  const gymVisits = gymDays.length;

  let avgPerWeek = '—';
  if (gymDays.length >= 2) {
    const sorted = gymDays.sort();
    const spanMs = new Date(sorted[sorted.length - 1]).getTime() - new Date(sorted[0]).getTime();
    const weeks = Math.max(1, spanMs / (7 * 24 * 60 * 60 * 1000));
    avgPerWeek = (gymVisits / weeks).toFixed(1);
  } else if (gymDays.length === 1) {
    avgPerWeek = '1.0';
  }

  const indoorCalories = indoorActivities.reduce((s, a) => s + (a.calories ?? 0), 0);
  const avgCalPerVisit = gymVisits > 0 ? Math.round(indoorCalories / gymVisits) : 0;
  const latestWeight = [...data.biometrics].filter((b) => b.metric === 'Weight').pop();

  return (
    <View className="flex-row mb-4">
      <StatCard label="Gym Visits" value={gymVisits} color="#3b82f6" />
      <StatCard label="Avg / Week" value={avgPerWeek} unit="visits" color="#8b5cf6" />
      <StatCard label="Avg Cal/Visit" value={avgCalPerVisit.toLocaleString()} unit="kcal" color="#10b981" />
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
        <SectionHeader title="Gym Visits" subtitle="Days at the gym per period" />
        <WorkoutFrequencyChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Activity Breakdown" subtitle="Calories burned by type" />
        <ActivityTypeBreakdown />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Training Load" subtitle="Total active minutes per period" />
        <TrainingLoadChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Intensity (MetsMin)" subtitle="Metabolic load per period · higher is harder" />
        <MetsMinChart />
      </View>
    </ScrollView>
  );
}
