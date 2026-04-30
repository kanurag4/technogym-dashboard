import { ScrollView, View } from 'react-native';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { FilterBar } from '../../src/components/filters/FilterBar';
import { TotalWeightLiftedChart } from '../../src/components/charts/TotalWeightLiftedChart';
import { RowingPerformanceChart } from '../../src/components/charts/RowingPerformanceChart';

export default function StrengthScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-900" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <FilterBar showTypes={false} showGranularity />

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Total Weight Lifted" subtitle="kg lifted across all strength sessions" />
        <TotalWeightLiftedChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Rowing Performance" subtitle="Monthly avg distance and power" />
        <RowingPerformanceChart />
      </View>
    </ScrollView>
  );
}
