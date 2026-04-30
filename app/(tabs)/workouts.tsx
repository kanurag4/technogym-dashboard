import { ScrollView, View } from 'react-native';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { FilterBar } from '../../src/components/filters/FilterBar';
import { CaloriesOverTimeChart } from '../../src/components/charts/CaloriesOverTimeChart';
import { TotalWeightLiftedChart } from '../../src/components/charts/TotalWeightLiftedChart';

export default function WorkoutsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-900" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <FilterBar showTypes showGranularity />

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Calories Burned" subtitle="Indoor vs outdoor by period" />
        <CaloriesOverTimeChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Weight Lifted" subtitle="Total kg across strength sessions" />
        <TotalWeightLiftedChart />
      </View>
    </ScrollView>
  );
}
