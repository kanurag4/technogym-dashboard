import { ScrollView, View, Text } from 'react-native';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { FilterBar } from '../../src/components/filters/FilterBar';
import { StatCard } from '../../src/components/ui/StatCard';
import { CardioDistanceChart } from '../../src/components/charts/CardioDistanceChart';
import { CardioCaloriesChart } from '../../src/components/charts/CardioCaloriesChart';
import { CardioPaceChart } from '../../src/components/charts/CardioPaceChart';
import { CardioElevationChart } from '../../src/components/charts/CardioElevationChart';
import { RowingCardioChart } from '../../src/components/charts/RowingCardioChart';
import { useCardioDistance, useCardioCalories, useCardioPace } from '../../src/hooks/useFilteredData';

function CardioStats() {
  const distData = useCardioDistance();
  const calData = useCardioCalories();
  const paceData = useCardioPace();

  const totalSessions = distData.reduce((s, d) => s + 1, 0);
  const totalKm = distData.reduce((s, d) => s + d.value, 0);
  const totalCal = calData.reduce((s, d) => s + d.value, 0);
  const avgPaceSec = paceData.length > 0
    ? paceData.reduce((s, d) => s + d.value, 0) / paceData.length
    : 0;
  const paceMin = Math.floor(avgPaceSec / 60);
  const paceSec = Math.round(avgPaceSec % 60);
  const paceLabel = avgPaceSec > 0 ? `${paceMin}:${String(paceSec).padStart(2, '0')}` : '—';

  return (
    <View className="flex-row mb-4">
      <StatCard label="Distance" value={totalKm.toFixed(1)} unit="km" color="#3b82f6" />
      <StatCard label="Calories" value={Math.round(totalCal).toLocaleString()} unit="kcal" color="#10b981" />
      <StatCard label="Avg Pace" value={paceLabel} unit="/km" color="#f59e0b" />
    </View>
  );
}

export default function CardioScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-900" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <FilterBar showTypes={false} showGranularity />
      <CardioStats />

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Distance" subtitle="km covered per period" />
        <CardioDistanceChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Calories Burned" subtitle="kcal from cardio & outdoor sessions" />
        <CardioCaloriesChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Avg Pace" subtitle="min/km · lower is faster · green = best" />
        <CardioPaceChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Elevation Gain" subtitle="total meters climbed per period" />
        <CardioElevationChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Rowing" subtitle="total distance or calories per period" />
        <RowingCardioChart />
      </View>
    </ScrollView>
  );
}
