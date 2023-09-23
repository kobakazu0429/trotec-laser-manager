export interface GetUsersResponse {
  users: {
    id: string;
    email: string;
    name: string;
    roles: Array<"MdbAdmin" | "User" | "Admin" | "Superadmin">;
    permissions: Array<"IsUser" | "IsAdmin" | "IsSuperadmin" | "CanModifyMdb">;
    active: 0 | 1;
    updatedOn: string;
    createdOn: string;
  }[];

  hasOrganizationContextAccess: 0 | 1;
}
export type CreateUserResponse = GetUsersResponse["users"][0];

export interface SignInResponse {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  token: string;
  preferences: Preferences;
  temporaryPassword: number;
  updatedOnTimestamp: number;
  isHmi: number;
  hasSecret: number;
  activeExperimentalFeatures: string[];
  eulaAccepted: number;
  currentEulaVersion: string;
}

export interface Preferences {
  Language: Language;
  FavouriteMaterials: FavouriteMaterials;
  ShowTutorial: ShowTutorial;
  UseImperialUnits: UseImperialUnits;
  LastLensNotificationClosedDate: LastLensNotificationClosedDate;
  PdfImportProfile: PdfImportProfile;
  PdfImportMode: PdfImportMode;
  PdfImportPageLimit: PdfImportPageLimit;
}

export interface Language {
  jobQueueLock: number;
  type: string;
  unit: string;
  readOnly: number;
  selectItems: SelectItem[];
  key: string;
  value: string;
}

export interface SelectItem {
  key: string;
  name: string;
  disabled: number;
}

export interface FavouriteMaterials {
  jobQueueLock: number;
  type: string;
  unit: string;
  readOnly: number;
  key: string;
  value: string;
}

export interface ShowTutorial {
  jobQueueLock: number;
  defaultValue: number;
  type: string;
  unit: string;
  readOnly: number;
  key: string;
  value: number;
}

export interface UseImperialUnits {
  jobQueueLock: number;
  defaultValue: number;
  type: string;
  unit: string;
  readOnly: number;
  key: string;
  value: number;
}

export interface LastLensNotificationClosedDate {
  jobQueueLock: number;
  defaultValue: string;
  type: string;
  unit: string;
  readOnly: number;
  key: string;
  value: string;
}

export interface PdfImportProfile {
  jobQueueLock: number;
  defaultValue: string;
  type: string;
  unit: string;
  readOnly: number;
  selectItems: SelectItem2[];
  key: string;
  value: string;
}

export interface SelectItem2 {
  key: string;
  name: string;
  disabled: number;
}

export interface PdfImportMode {
  jobQueueLock: number;
  defaultValue: string;
  type: string;
  unit: string;
  readOnly: number;
  selectItems: SelectItem3[];
  key: string;
  value: string;
}

export interface SelectItem3 {
  key: string;
  name: string;
  disabled: number;
}

export interface PdfImportPageLimit {
  jobQueueLock: number;
  defaultValue: number;
  type: string;
  unit: string;
  readOnly: number;
  min: number;
  max: number;
  key: string;
  value: number;
}
