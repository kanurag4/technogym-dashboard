import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useCaloriesOverTime } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function CaloriesOverTimeChart() {
  const data = useCaloriesOverTime();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-400 text-sm">No calorie data</Text>
      </View>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.indoor + d.outdoor));
  const { barWidth, spacing } = barDims(WIDTH, data.length);

  const stackData = data.map((d) => {
    const total = d.indoor + d.outdoor;
    return {
      stacks: [
        { value: d.indoor, color: '#3b82f6' },
        { value: d.outdoor, color: '#8b5cf6' },
      ],
      label: d.label,
      topLabelComponent: () => (
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
          {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(total)}
        </Text>
      ),
    };
  });

  return (
    <View>
      <View style={{ paddingTop: 24 }}>
      <BarChart
        stackData={stackData}
        barWidth={barWidth}
        barBorderRadius={4}
        height={160}
        width={WIDTH}
        maxValue={Math.ceil(maxTotal * 1.25)}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#374151"
        noOfSections={4}
        yAxisTextStyle={{ color: '#9ca3af', fontSize: 11 }}
        xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 11, fontWeight: '600' }}
        spacing={spacing}
        hideRules
        isAnimated
      />
      </View>
      <View className="flex-row gap-4 mt-2 px-2">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-blue-500" />
          <Text className="text-xs text-gray-500">Indoor</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-purple-500" />
          <Text className="text-xs text-gray-500">Outdoor</Text>
        </View>
      </View>
    </View>
  );
}
