import type { RawMasterData } from '../../types/raw';
import type { UserProfile } from '../../types/domain';

export function parseMasterData(raw: RawMasterData): UserProfile {
  const bd = String(raw.birthDate);
  const birthDate = `${bd.slice(0, 4)}-${bd.slice(4, 6)}-${bd.slice(6, 8)}`;
  return {
    firstName: raw.firstName,
    lastName: raw.lastName,
    birthDate,
    gender: raw.gender,
    email: raw.email,
    timezone: raw.timezone,
  };
}
