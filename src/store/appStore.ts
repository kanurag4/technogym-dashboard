import { create } from 'zustand';
import type { AppData, FilterState, LoadStatus, ActivityType } from '../types/domain';
import { saveAppData, loadAppData, clearAppData } from '../lib/storage';

export const PREFERRED_METRICS: Record<string, string> = {
  'Weight':               'Weight',
  'BMI':                  'BMI',
  'Fat Mass':             'Fat Mass',
  'Basal Metabolic Rate': 'BMR',
  'Extra Cellular Water': 'ECW',
  'Fat Free Mass':        'FFM',
  'Bone Mass':            'Bone Mass',
  'Muscle Mass':          'Muscle Mass',
  'Visceral Fat Rating':  'Visceral Fat',
  'Metabolic Age':        'Metabolic Age',
};

// Ordered list of preferred metric keys (data names)
export const PREFERRED_METRIC_KEYS = Object.keys(PREFERRED_METRICS);

interface AppStore {
  data: AppData | null;
  status: LoadStatus;
  error: string | null;
  filters: FilterState;
  setData: (data: AppData) => void;
  setStatus: (status: LoadStatus, error?: string) => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  initFromStorage: () => Promise<void>;
  clearData: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  dateFrom: null,
  dateTo: null,
  activityTypes: ['strength', 'cardio', 'rowing', 'outdoor'],
  granularity: 'weekly',
  biometricMetrics: ['Weight'],
};

export const useAppStore = create<AppStore>((set) => ({
  data: null,
  status: 'idle',
  error: null,
  filters: DEFAULT_FILTERS,

  setData: (data) => {
    saveAppData(data);
    set({
      data,
      status: 'ready',
      error: null,
      filters: {
        ...DEFAULT_FILTERS,
        biometricMetrics: data.allBiometricMetrics.includes('Weight') ? ['Weight'] : [data.allBiometricMetrics[0]],
      },
    });
  },

  setStatus: (status, error?) => set({ status, error: error ?? null }),

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  initFromStorage: async () => {
    const data = await loadAppData();
    if (data) {
      set({
        data,
        status: 'ready',
        error: null,
        filters: {
          ...DEFAULT_FILTERS,
          biometricMetrics: data.allBiometricMetrics.includes('Weight') ? ['Weight'] : [data.allBiometricMetrics[0]],
        },
      });
    }
  },

  clearData: () => {
    clearAppData();
    set({ data: null, status: 'idle', error: null, filters: DEFAULT_FILTERS });
  },
}));

export function toggleActivityType(
  current: ActivityType[],
  type: ActivityType
): ActivityType[] {
  return current.includes(type)
    ? current.filter((t) => t !== type)
    : [...current, type];
}

