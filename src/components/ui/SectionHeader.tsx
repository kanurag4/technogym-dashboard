import { View, Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-gray-100">{title}</Text>
      {subtitle && <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>}
    </View>
  );
}
