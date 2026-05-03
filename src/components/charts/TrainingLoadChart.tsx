import { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTrainingLoad } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

const formatMin = (v: number) =>
  v >= 60 ? `${Math.floor(v / 60)}h${v % 60 > 0 ? (v % 60) + 'm' : ''}` : `${v}m`;

export function TrainingLoadChart() {
  const [mode, setMode] = useState<'total' | 'avg'>('total');
  const data = useTrainingLoad(mode);
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No training data</Text>
      </View>
    );
  }

  const peak = Math.max(...data.map((d) => d.value));
  const { barWidth, spacing } = barDims(WIDTH, data.length);
  const chartKey = `${data.map((d) => d.label).join('|')}|${mode}`;

  const barData = data.map((d) => ({
    value: d.value,
    label: d.label,
    frontColor: d.value === peak ? '#8b5cf6' : '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {formatMin(d.value)}
      </Text>
    ),
  }));

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row bg-gray-700 rounded-lg p-1">
          {(['total', 'avg'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              className={`px-3 py-1 rounded-md ${mode === m ? 'bg-gray-500' : ''}`}
            >
              <Text className={`text-xs font-semibold ${mode === m ? 'text-white' : 'text-gray-400'}`}>
                {m === 'total' ? 'Total' : 'Avg/Session'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400">Peak period</Text>
          <Text className="text-sm font-bold text-violet-400">{formatMin(peak)}</Text>
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
