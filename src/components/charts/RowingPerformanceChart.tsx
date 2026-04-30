import { View, Text, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useRowingPerformance } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function RowingPerformanceChart() {
  const data = useRowingPerformance();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No rowing data</Text>
      </View>
    );
  }

  const { barWidth, spacing } = barDims(WIDTH, data.length);
  const totalSessions = data.reduce((s, d) => s + d.sessions, 0);
  const maxDist = Math.max(...data.map((d) => d.avgDistanceM));
  const maxPow = Math.max(...data.map((d) => d.avgPower));

  const distanceData = data.map((d) => ({
    value: d.avgDistanceM,
    label: d.label,
    frontColor: '#f59e0b',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {d.avgDistanceM}m
      </Text>
    ),
  }));

  const powerData = data.map((d) => ({
    value: d.avgPower,
    label: d.label,
    frontColor: '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {d.avgPower}W
      </Text>
    ),
  }));

  const hasPower = data.some((d) => d.avgPower > 0);

  return (
    <View>
      <Text className="text-xs text-gray-400 mb-3">{totalSessions} sessions · monthly avg</Text>

      <Text className="text-xs font-medium text-gray-400 mb-2">Avg Distance (m)</Text>
      <View style={{ paddingTop: 24 }}>
        <BarChart
          data={distanceData}
          barWidth={barWidth}
          barBorderRadius={4}
          height={160}
          width={WIDTH}
          maxValue={Math.ceil(maxDist * 1.25)}
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

      {hasPower && (
        <View className="mt-4">
          <Text className="text-xs font-medium text-gray-400 mb-2">Avg Power (W)</Text>
          <View style={{ paddingTop: 24 }}>
            <BarChart
              data={powerData}
              barWidth={barWidth}
              barBorderRadius={4}
              height={120}
              width={WIDTH}
              maxValue={Math.ceil(maxPow * 1.25)}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="#374151"
              noOfSections={3}
              yAxisTextStyle={{ color: '#9ca3af', fontSize: 11 }}
              xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 11, fontWeight: '600' }}
              hideRules
              isAnimated
              spacing={spacing}
            />
          </View>
        </View>
      )}
    </View>
  );
}
