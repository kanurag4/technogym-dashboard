import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export function StatCard({ label, value, unit, color = '#3b82f6' }: StatCardProps) {
  return (
    <View className="bg-gray-800 rounded-2xl p-4 flex-1 mx-1">
      <View className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: color }} />
      <Text className="text-2xl font-bold text-gray-100">
        {value}
        {unit && <Text className="text-sm font-normal text-gray-400"> {unit}</Text>}
      </Text>
      <Text className="text-xs text-gray-400 mt-1">{label}</Text>
    </View>
  );
}
