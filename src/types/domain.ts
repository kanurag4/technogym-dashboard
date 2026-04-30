export interface UserProfile {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
  timezone: string;
}

export interface BiometricEntry {
  date: Date;
  metric: string;
  value: number;
}

export type ActivityType = 'strength' | 'cardio' | 'rowing' | 'outdoor';

export interface ExerciseSet {
  phId: string;
  exerciseLabel: string;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  restTimeSec?: number;
  metrics: Record<string, number>;
}

export interface Activity {
  id: string;
  date: Date;
  type: ActivityType;
  sourceType: 'indoor' | 'outdoor';
  durationSec?: number;
  calories?: number;
  distanceM?: number;
  metrics: Record<string, number>;
  sets?: ExerciseSet[];
  activityName?: string;
}

export interface FilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  activityTypes: ActivityType[];
  granularity: 'weekly' | 'monthly';
  biometricMetrics: string[];
}

export interface AppData {
  profile: UserProfile;
  biometrics: BiometricEntry[];
  activities: Activity[];
  allBiometricMetrics: string[];
}

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
