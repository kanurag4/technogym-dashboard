import { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useRowingPerformance } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function RowingCardioChart() {
  const [mode, setMode] = useState<'distance' | 'calories'>('distance');
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

  const values = data.map((d) => mode === 'distance' ? d.totalDistanceM : d.totalCalories);
  const peak = Math.max(...values);
  const chartKey = data.map((d) => d.label).join('|') + mode;
  const { barWidth, spacing } = barDims(WIDTH, data.length);

  const barData = data.map((d, i) => ({
    value: values[i],
    label: d.label,
    frontColor: values[i] === peak ? '#f59e0b' : '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {mode === 'distance'
          ? values[i] >= 1000 ? `${(values[i] / 1000).toFixed(1)}k` : `${values[i]}m`
          : String(values[i])}
      </Text>
    ),
  }));

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xs text-gray-400">
          {data.reduce((s, d) => s + d.sessions, 0)} sessions
        </Text>

        <View className="flex-row bg-gray-700 rounded-full p-0.5">
          {(['distance', 'calories'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              className={`px-3 py-1 rounded-full ${mode === m ? 'bg-gray-900' : ''}`}
            >
              <Text className={`text-xs font-semibold ${mode === m ? 'text-blue-400' : 'text-gray-500'}`}>
                {m === 'distance' ? 'Distance' : 'Calories'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs text-gray-400">
          {mode === 'distance' ? `Peak ${peak >= 1000 ? `${(peak / 1000).toFixed(1)}k` : peak}m` : `Peak ${peak} kcal`}
        </Text>
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
