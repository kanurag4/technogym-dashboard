import { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useCaloriesOverTime } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function CaloriesOverTimeChart() {
  const [mode, setMode] = useState<'total' | 'avg'>('total');
  const data = useCaloriesOverTime(mode);
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
  const overallTotal = data.reduce((s, d) => s + d.indoor + d.outdoor, 0);
  const { barWidth, spacing } = barDims(WIDTH, data.length);
  const chartKey = data.map((d) => d.label).join('|') + mode;

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
      <View className="flex-row justify-between items-center mb-3">
        <View>
          {mode === 'total' ? (
            <>
              <Text className="text-xs text-gray-400">Total calories</Text>
              <Text className="text-sm font-bold text-gray-200">
                {Math.round(overallTotal).toLocaleString()} kcal
              </Text>
            </>
          ) : (
            <>
              <Text className="text-xs text-gray-400">Avg per session</Text>
              <Text className="text-sm font-bold text-gray-200">
                {Math.round(overallTotal / data.length).toLocaleString()} kcal
              </Text>
            </>
          )}
        </View>

        <View className="flex-row bg-gray-700 rounded-full p-0.5">
          {(['total', 'avg'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              className={`px-3 py-1 rounded-full ${mode === m ? 'bg-gray-900' : ''}`}
            >
              <Text className={`text-xs font-semibold ${mode === m ? 'text-blue-400' : 'text-gray-500'}`}>
                {m === 'avg' ? 'Avg/session' : 'Total'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="items-end">
          <Text className="text-xs text-gray-400">Peak period</Text>
          <Text className="text-sm font-bold text-blue-400">
            {maxTotal >= 1000 ? `${(maxTotal / 1000).toFixed(1)}k` : maxTotal} kcal
          </Text>
        </View>
      </View>

      <View style={{ paddingTop: 24 }}>
        <BarChart
          key={chartKey}
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
