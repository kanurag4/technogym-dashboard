import JSZip from 'jszip';
import { Platform } from 'react-native';

export interface TechnoGymFiles {
  masterdata: string;
  biometrics: string;
  indooractivities: string;
  outdooractivities: string;
}

async function readZipData(fileUri: string): Promise<ArrayBuffer | string> {
  if (Platform.OS === 'web') {
    // On web, expo-document-picker gives a blob URL — fetch it directly
    const response = await fetch(fileUri);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
    return response.arrayBuffer();
  } else {
    // On native, use expo-file-system/legacy to read as base64
    const { readAsStringAsync, EncodingType } = await import('expo-file-system/legacy');
    return readAsStringAsync(fileUri, { encoding: EncodingType.Base64 });
  }
}

export async function extractTechnoGymZip(fileUri: string): Promise<TechnoGymFiles> {
  const data = await readZipData(fileUri);

  const zip =
    typeof data === 'string'
      ? await JSZip.loadAsync(data, { base64: true })
      : await JSZip.loadAsync(data);

  const result: Partial<TechnoGymFiles> = {};

  for (const [name, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const lower = name.toLowerCase();
    if (lower.includes('masterdata')) {
      result.masterdata = await file.async('string');
    } else if (lower.includes('biometrics')) {
      result.biometrics = await file.async('string');
    } else if (lower.includes('indooractivities')) {
      result.indooractivities = await file.async('string');
    } else if (lower.includes('outdooractivities')) {
      result.outdooractivities = await file.async('string');
    }
  }

  const missing = (
    ['masterdata', 'biometrics', 'indooractivities', 'outdooractivities'] as const
  ).filter((k) => !result[k]);

  if (missing.length > 0) {
    throw new Error(`Missing files in ZIP: ${missing.join(', ')}`);
  }

  return result as TechnoGymFiles;
}
