import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData } from '../types/domain';

const KEY = 'appData_v1';

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const serialized = JSON.stringify({
      ...data,
      biometrics: data.biometrics.map((b) => ({ ...b, date: b.date.toISOString() })),
      activities: data.activities.map((a) => ({ ...a, date: a.date.toISOString() })),
    });
    await AsyncStorage.setItem(KEY, serialized);
  } catch {
    // storage errors are non-fatal
  }
}

export async function loadAppData(): Promise<AppData | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return {
      ...d,
      biometrics: d.biometrics.map((b: { date: string } & object) => ({ ...b, date: new Date(b.date) })),
      activities: d.activities.map((a: { date: string } & object) => ({ ...a, date: new Date(a.date) })),
    };
  } catch {
    return null;
  }
}

export async function clearAppData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
