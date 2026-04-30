import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useActivityTypeBreakdown } from '../../hooks/useFilteredData';

export function ActivityTypeBreakdown() {
  const breakdown = useActivityTypeBreakdown();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (breakdown.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No calorie data</Text>
      </View>
    );
  }

  const total = breakdown.reduce((s, d) => s + d.calories, 0);
  const sorted = [...breakdown].sort((a, b) => b.calories - a.calories);
  const maxCal = sorted[0].calories;

  const barData = sorted.map((d) => ({
    value: d.calories,
    label: d.type.charAt(0).toUpperCase() + d.type.slice(1),
    frontColor: d.color,
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 4 }}>
        {(d.calories / 1000).toFixed(1)}k ({Math.round((d.calories / total) * 100)}%)
      </Text>
    ),
  }));

  return (
    <View style={{ paddingTop: 24 }}>
      <BarChart
        data={barData}
        barWidth={48}
        barBorderRadius={6}
        height={180}
        width={WIDTH}
        maxValue={Math.ceil(maxCal * 1.25)}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#374151"
        noOfSections={4}
        yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 11, fontWeight: '600' }}
        hideRules
        isAnimated
        spacing={24}
      />
      <View className="flex-row justify-center gap-4 mt-3 flex-wrap">
        {sorted.map((d) => (
          <View key={d.type} className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
            <Text className="text-xs text-gray-400 capitalize">
              {d.type} · {d.calories.toLocaleString()} kcal
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
