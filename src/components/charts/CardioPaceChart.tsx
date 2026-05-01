import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useCardioPace } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

function fmtPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function CardioPaceChart() {
  const data = useCardioPace();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No pace data</Text>
      </View>
    );
  }

  // Lower pace = faster = better; highlight the minimum
  const best = Math.min(...data.map((d) => d.value));
  const worst = Math.max(...data.map((d) => d.value));
  const { barWidth, spacing } = barDims(WIDTH, data.length);
  const chartKey = data.map((d) => d.label).join('|');

  const barData = data.map((d) => ({
    value: d.value,
    label: d.label,
    frontColor: d.value === best ? '#10b981' : '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {fmtPace(d.value)}
      </Text>
    ),
  }));

  return (
    <View>
      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-xs text-gray-400">Fastest avg pace</Text>
          <Text className="text-sm font-bold text-emerald-400">{fmtPace(best)} /km</Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400">Slowest avg pace</Text>
          <Text className="text-sm font-bold text-gray-200">{fmtPace(worst)} /km</Text>
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
          maxValue={Math.ceil(worst * 1.25)}
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
