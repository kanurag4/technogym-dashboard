import type { RawBiometricRecord } from '../../types/raw';
import type { BiometricEntry } from '../../types/domain';

export function parseBiometrics(raw: RawBiometricRecord[]): BiometricEntry[] {
  return raw
    .map((r) => ({
      date: new Date(r.measuredOn),
      metric: r.name,
      value: typeof r.value === 'string' ? parseFloat(r.value) : r.value,
    }))
    .filter((e) => !isNaN(e.value) && !isNaN(e.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
