import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'exerciseNameMap';

const STATIC_MAP: Record<string, string> = {};

let _cache: Record<string, string> | null = null;

async function loadCache(): Promise<Record<string, string>> {
  if (_cache) return _cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    _cache = raw ? JSON.parse(raw) : {};
  } catch {
    _cache = {};
  }
  return _cache!;
}

export function labelExercise(phId: string): string {
  const cached = _cache?.[phId];
  if (cached) return cached;
  if (STATIC_MAP[phId]) return STATIC_MAP[phId];
  return `Exercise ${phId.slice(0, 6)}`;
}

export async function setExerciseName(phId: string, name: string): Promise<void> {
  const map = await loadCache();
  map[phId] = name;
  _cache = map;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function initExerciseMap(): Promise<void> {
  await loadCache();
}
