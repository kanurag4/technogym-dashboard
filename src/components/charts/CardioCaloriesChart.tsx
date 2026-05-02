import { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useCardioCalories } from '../../hooks/useFilteredData';
import { barDims } from '../../lib/utils';

export function CardioCaloriesChart() {
  const [mode, setMode] = useState<'total' | 'avg'>('total');
  const data = useCardioCalories(mode);
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (data.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No cardio calories data</Text>
      </View>
    );
  }

  const peak = Math.max(...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const totalSessions = data.reduce((s, d) => s + (d.sessionCount ?? 1), 0);
  const { barWidth, spacing } = barDims(WIDTH, data.length);
  const chartKey = data.map((d) => d.label).join('|') + mode;

  const barData = data.map((d) => ({
    value: d.value,
    label: d.label,
    frontColor: d.value === peak ? '#10b981' : '#3b82f6',
    topLabelComponent: () => (
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#e5e7eb', marginBottom: 3 }}>
        {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : String(d.value)}
      </Text>
    ),
  }));

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <View>
          {mode === 'total' ? (
            <>
              <Text className="text-xs text-gray-400">Total calories</Text>
              <Text className="text-sm font-bold text-gray-200">{Math.round(total).toLocaleString()} kcal</Text>
            </>
          ) : (
            <>
              <Text className="text-xs text-gray-400">Overall avg / session</Text>
              <Text className="text-sm font-bold text-gray-200">
                {totalSessions > 0 ? Math.round(total / totalSessions).toLocaleString() : '—'} kcal
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
          <Text className="text-sm font-bold text-emerald-400">{peak.toLocaleString()} kcal</Text>
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
