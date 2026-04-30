import { ScrollView, View } from 'react-native';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { FilterBar } from '../../src/components/filters/FilterBar';
import { MetricSelector } from '../../src/components/ui/MetricSelector';
import { BiometricTrendChart } from '../../src/components/charts/BiometricTrendChart';
import { BodyCompositionSnapshot } from '../../src/components/charts/BodyCompositionSnapshot';

export default function BiometricsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-900" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <FilterBar showTypes={false} showGranularity={false} />

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Body Trend" subtitle="Select a metric to view trend" />
        <MetricSelector />
        <BiometricTrendChart />
      </View>

      <View className="bg-gray-800 rounded-2xl p-4 mb-4">
        <SectionHeader title="Body Composition" subtitle="Fat · Muscle · Bone (latest)" />
        <BodyCompositionSnapshot />
      </View>
    </ScrollView>
  );
}
