import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAppStore } from '../../store/appStore';
import { extractTechnoGymZip } from '../../lib/zip';
import { normalizeData } from '../../lib/normalize';

export function FileUploadScreen() {
  const { status, error, setStatus, setData } = useAppStore();

  async function pickAndParse() {
    if (status === 'loading') return;
    try {
      setStatus('loading');

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        setStatus('idle');
        return;
      }

      const { uri } = result.assets[0];
      const files = await extractTechnoGymZip(uri);
      const data = await normalizeData(files);
      setData(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setStatus('error', msg);
    }
  }

  return (
    <View className="flex-1 bg-gray-900 items-center justify-center px-8">
      <View className="w-20 h-20 bg-blue-500/20 rounded-full items-center justify-center mb-6">
        <Text style={{ fontSize: 36 }}>💪</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-100 mb-2 text-center">
        Technogym Dashboard
      </Text>
      <Text className="text-sm text-gray-400 text-center mb-8 leading-5">
        Select your Technogym export ZIP file to view your fitness insights and body composition trends.
      </Text>

      {status === 'loading' ? (
        <View className="items-center gap-3">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-400">Parsing your data…</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickAndParse}
          className="bg-blue-500 px-8 py-4 rounded-2xl active:bg-blue-600"
        >
          <Text className="text-white font-bold text-base">Select ZIP File</Text>
        </TouchableOpacity>
      )}

      {status === 'error' && (
        <View className="mt-6 bg-red-900/40 border border-red-700 rounded-xl p-4 w-full">
          <Text className="text-red-400 text-sm font-medium mb-1">Failed to load file</Text>
          <Text className="text-red-500 text-xs">{error}</Text>
          <TouchableOpacity onPress={pickAndParse} className="mt-3">
            <Text className="text-blue-400 text-sm font-medium">Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-xs text-gray-600 mt-8 text-center">
        Your data stays on your device.{'\n'}No account or internet required.
      </Text>
    </View>
  );
}
