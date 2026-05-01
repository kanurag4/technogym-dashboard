import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useWorkoutFrequency } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function WorkoutFrequencyChart() {
  const data = useWorkoutFrequency();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-400 text-sm">No workout data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value));
  const { barWidth, spacing } = barDims(WIDTH, data.length);

  const barData = data.map((d) => ({
    value: d.value,
    label: d.label,
    frontColor: '#3b82f6',
    topLabelComponent: () =>
      d.value > 0 ? (
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>{d.value}</Text>
      ) : null,
  }));

  return (
    <View style={{ paddingTop: 24 }}>
      <BarChart
        data={barData}
        barWidth={barWidth}
        barBorderRadius={4}
        height={160}
        width={WIDTH}
        maxValue={Math.ceil(maxVal * 1.25)}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#374151"
        noOfSections={4}
        yAxisTextStyle={{ color: '#9ca3af', fontSize: 11 }}
        xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 11, fontWeight: '600' }}
        hideRules
        isAnimated
        spacing={spacing}
      />
    </View>
  );
}
