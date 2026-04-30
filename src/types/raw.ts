export interface RawMasterData {
  id: string;
  credentialId: string;
  firstName: string;
  lastName: string;
  birthDate: number;
  gender: string;
  email: string;
  twoLetterISOCountryName: string;
  timezone: string;
  twoLetterISOLanguageName: string;
}

export interface RawBiometricRecord {
  name: string;
  measuredOn: string;
  value: string | number;
}

export interface RawMetricPair {
  n: string;
  v: number | string;
}

export interface RawActivitySegment {
  pos: number;
  pr: RawMetricPair[];
  phId?: string;
}

export interface RawIndoorActivity {
  phId?: string;
  on: string;
  user: string;
  facility?: string;
  performedData: {
    pr: RawMetricPair[];
    st?: RawActivitySegment[];
  };
  createdOn: string;
  id: string;
}

export interface RawOutdoorActivity {
  activityName: string;
  userId: string;
  performedDate: string;
  gpsData: boolean;
  physicalActivityData: {
    pr: RawMetricPair[];
  };
  createdOn: string;
  id: string;
}
