import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { PREFERRED_METRICS, PREFERRED_METRIC_KEYS } from '../../store/appStore';
import { useAppStore } from '../../store/appStore';

export function MetricSelector() {
  const { data, filters, setFilter } = useAppStore();
  if (!data) return null;

  const available = PREFERRED_METRIC_KEYS.filter((k) => data.allBiometricMetrics.includes(k));
  const selected = filters.biometricMetrics[0];

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 4, paddingRight: 8 }}
      >
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {available.map((key) => {
            const isSelected = key === selected;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter('biometricMetrics', [key])}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#3b82f6' : '#4b5563',
                  backgroundColor: isSelected ? '#3b82f625' : '#374151',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: isSelected ? '#3b82f6' : '#9ca3af' }}>
                  {PREFERRED_METRICS[key]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
