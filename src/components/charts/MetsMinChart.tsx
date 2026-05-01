import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useMetsMinTrend } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function MetsMinChart() {
  const data = useMetsMinTrend();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No MetsMin data</Text>
      </View>
    );
  }

  const peak = Math.max(...data.map((d) => d.value));
  const avg = (data.reduce((s, d) => s + d.value, 0) / data.length).toFixed(1);
  const { barWidth, spacing } = barDims(WIDTH, data.length);
  const chartKey = data.map((d) => d.label).join('|');

  const barData = data.map((d) => ({
    value: d.value,
    label: d.label,
    frontColor: d.value === peak ? '#f59e0b' : '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {d.value.toFixed(0)}
      </Text>
    ),
  }));

  return (
    <View>
      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-xs text-gray-400">Avg per period</Text>
          <Text className="text-sm font-bold text-gray-200">{avg}</Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400">Peak period</Text>
          <Text className="text-sm font-bold text-amber-400">{peak.toFixed(0)}</Text>
        </View>
      </View>

      <View style={{ paddingTop: 24 }}>
        <BarChart
          key={chartKey}
          data={barData}
          barWidth={barWidth}
          barBorderRadius={4}
          height={180}
          width={WIDTH}
          maxValue={Math.ceil(peak * 1.25)}
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
    </View>
  );
}
