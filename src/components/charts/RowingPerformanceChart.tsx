import { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useRowingPerformance } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function RowingPerformanceChart() {
  const [mode, setMode] = useState<'avg' | 'total'>('avg');
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
  const distValues = data.map((d) => mode === 'avg' ? d.avgDistanceM : d.totalDistanceM);
  const maxDist = Math.max(...distValues);
  const maxPow = Math.max(...data.map((d) => d.avgPower));
  const chartKey = data.map((d) => d.label).join('|') + mode;

  const distanceData = data.map((d, i) => ({
    value: distValues[i],
    label: d.label,
    frontColor: distValues[i] === maxDist ? '#f59e0b' : '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {distValues[i] >= 1000 ? `${(distValues[i] / 1000).toFixed(1)}k` : `${distValues[i]}m`}
      </Text>
    ),
  }));

  const powerData = data.map((d) => ({
    value: d.avgPower,
    label: d.label,
    frontColor: d.avgPower === maxPow ? '#10b981' : '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {d.avgPower}W
      </Text>
    ),
  }));

  const hasPower = data.some((d) => d.avgPower > 0);

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xs text-gray-400">{totalSessions} sessions</Text>

        <View className="flex-row bg-gray-700 rounded-full p-0.5">
          {(['avg', 'total'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              className={`px-3 py-1 rounded-full ${mode === m ? 'bg-gray-900' : ''}`}
            >
              <Text className={`text-xs font-semibold capitalize ${mode === m ? 'text-blue-400' : 'text-gray-500'}`}>
                {m === 'avg' ? 'Avg/session' : 'Total'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text className="text-xs font-medium text-gray-400 mb-2">
        {mode === 'avg' ? 'Avg Distance / Session (m)' : 'Total Distance (m)'}
      </Text>
      <View style={{ paddingTop: 24 }}>
        <BarChart
          key={chartKey + '-dist'}
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
              key={chartKey + '-pow'}
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
