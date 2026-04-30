import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useBiometricSeries } from '../../hooks/useFilteredData';
import { PREFERRED_METRICS } from '../../store/appStore';
import { formatDayMonth } from '../../lib/utils';

export function BiometricTrendChart() {
  const s = useBiometricSeries();
  const { width } = useWindowDimensions();
  const WIDTH = width - 64;

  if (!s) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-gray-500 text-sm">No data for selected metric</Text>
      </View>
    );
  }

  const values = s.entries.map((e) => e.value);
  const n = values.length;
  const sMin = Math.min(...values);
  const sMax = Math.max(...values);
  const first = values[0];
  const latest = values[n - 1];
  const label = PREFERRED_METRICS[s.metric] ?? s.metric;

  // Headroom: 40% of value range, minimum 8% of max — prevents top-label clipping
  // even when the data range is narrow (e.g. weight 83–87 kg → only 4 units range).
  const range = sMax - sMin || sMax * 0.1;
  const chartMax = sMax + Math.max(range * 0.4, sMax * 0.08);

  // Show a label on every point when there is at least 32px per point; otherwise
  // thin to every Nth point so labels don't overlap on dense datasets.
  const pointSpacing = WIDTH / Math.max(n - 1, 1);
  const labelEvery = Math.ceil(32 / pointSpacing);

  const lineData = s.entries.map((e, i) => {
    const showVal = i % labelEvery === 0 || i === n - 1;
    return {
      value: e.value,
      label: i === 0 || i === n - 1 ? formatDayMonth(e.date) : '',
      dataPointLabelComponent: showVal
        ? () => (
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#e5e7eb', marginBottom: 2 }}>
              {e.value.toFixed(1)}
            </Text>
          )
        : undefined,
      dataPointLabelShiftY: -22,
      dataPointLabelShiftX: i === 0 ? 4 : i === n - 1 ? -28 : -10,
    };
  });

  return (
    <View>
      {/* paddingTop reserves space above the chart so shifted-up labels aren't clipped */}
      <View style={{ paddingTop: 28 }}>
      <LineChart
        data={lineData}
        width={WIDTH}
        height={210}
        curved
        color={s.color}
        dataPointsColor={s.color}
        dataPointsRadius={n > 30 ? 2 : 4}
        thickness={2}
        maxValue={chartMax}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#374151"
        yAxisTextStyle={{ color: '#9ca3af', fontSize: 11 }}
        xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        hideRules={false}
        rulesColor="#1f2937"
        noOfSections={4}
        isAnimated
      />
      </View>

      <View className="flex-row items-center mt-3">
        <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: s.color }} />
        <Text className="text-xs font-semibold flex-1" style={{ color: s.color }}>{label}</Text>
        <Text className="text-xs text-gray-400">
          {sMin.toFixed(1)}–{sMax.toFixed(1)} · {first.toFixed(1)} → {latest.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}
