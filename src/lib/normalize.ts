import type { TechnoGymFiles } from './zip';
import type { AppData } from '../types/domain';
import { parseMasterData } from './parsers/masterdata';
import { parseBiometrics } from './parsers/biometrics';
import { parseIndoorActivities } from './parsers/indoorActivities';
import { parseOutdoorActivities } from './parsers/outdoorActivities';
import { initExerciseMap } from './exerciseMap';

export async function normalizeData(files: TechnoGymFiles): Promise<AppData> {
  await initExerciseMap();

  const profile = parseMasterData(JSON.parse(files.masterdata));
  const biometrics = parseBiometrics(JSON.parse(files.biometrics));
  const indoor = parseIndoorActivities(JSON.parse(files.indooractivities));
  const outdoor = parseOutdoorActivities(JSON.parse(files.outdooractivities));

  const activities = [...indoor, ...outdoor].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const allBiometricMetrics = [...new Set(biometrics.map((b) => b.metric))].sort();

  return { profile, biometrics, activities, allBiometricMetrics };
}
