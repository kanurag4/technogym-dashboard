import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useAppStore } from '../../store/appStore';

// Fat Mass + Muscle Mass + Bone Mass are mutually exclusive and sum to ~body weight.
// Total Body Water is NOT additive — it is contained within muscle/lean tissue,
// so including it would double-count and exceed body weight.
const SEGMENTS = [
  { metric: 'Fat Mass', color: '#f59e0b', label: 'Fat' },
  { metric: 'Muscle Mass', color: '#3b82f6', label: 'Muscle' },
  { metric: 'Bone Mass', color: '#10b981', label: 'Bone' },
];

export function BodyCompositionSnapshot() {
  const { data, filters } = useAppStore();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (!data) return null;

  const latest: Record<string, number> = {};
  for (const entry of data.biometrics) {
    if (filters.dateFrom && entry.date < filters.dateFrom) continue;
    if (filters.dateTo && entry.date > filters.dateTo) continue;
    latest[entry.metric] = entry.value;
  }

  const segments = SEGMENTS.map((s) => ({
    ...s,
    value: latest[s.metric] ?? 0,
  })).filter((s) => s.value > 0);

  if (segments.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No composition data</Text>
      </View>
    );
  }

  const total = segments.reduce((s, d) => s + d.value, 0);
  const maxSeg = Math.max(...segments.map((s) => s.value));
  const bodyWeight = latest['Weight'];

  const barData = segments.map((s) => ({
    value: s.value,
    label: s.label,
    frontColor: s.color,
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 4 }}>
        {s.value.toFixed(1)}kg
      </Text>
    ),
  }));

  return (
    <View style={{ paddingTop: 24 }}>
      <BarChart
        data={barData}
        barWidth={56}
        barBorderRadius={6}
        height={180}
        width={WIDTH}
        maxValue={Math.ceil(maxSeg * 1.25)}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#374151"
        noOfSections={4}
        yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 12, fontWeight: '600' }}
        hideRules
        isAnimated
        spacing={32}
      />

      <View className="flex-row justify-between mt-3 px-1">
        <View>
          <Text className="text-xs text-gray-500">Fat + Muscle + Bone</Text>
          <Text className="text-sm font-bold text-gray-200">{total.toFixed(1)} kg</Text>
        </View>
        {bodyWeight && (
          <View className="items-end">
            <Text className="text-xs text-gray-500">Body Weight</Text>
            <Text className="text-sm font-bold text-gray-200">{bodyWeight.toFixed(1)} kg</Text>
          </View>
        )}
      </View>

      {bodyWeight && (
        <View className="mt-2 bg-gray-700 rounded-lg px-3 py-2">
          <Text className="text-xs text-gray-400">
            Residual ({(bodyWeight - total).toFixed(1)} kg) = organ tissue, fluids, and other components not separately measured.
          </Text>
        </View>
      )}
    </View>
  );
}
