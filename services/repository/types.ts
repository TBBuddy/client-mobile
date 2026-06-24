export type UserRole = "PATIENT" | "SUPPORTER" | "ADMIN";
export type TreatmentStatus =
  | "NOT_PATIENT"
  | "ON_TREATMENT"
  | "RECOVERED"
  | "DROPPED";

export type RepositoryRequestOptions = {
  signal?: AbortSignal;
};

export type DataResponse<T> = {
  data: T;
};

export type MessageResponse = {
  message: string;
};

export type ValidationError = {
  field?: string;
  message?: string;
  [key: string]: unknown;
};

export type ApiErrorResponse = {
  statusCode?: number;
  code?: string;
  message?: string;
  errors?: ValidationError[] | Record<string, unknown> | null;
  path?: string;
  method?: string;
  timestamp?: string;
  requestId?: string;
};

export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  role: Extract<UserRole, "PATIENT" | "SUPPORTER">;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type LogoutRequest = {
  pushToken?: string;
};

export type AuthSessionUser = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  role: UserRole;
  treatmentStatus: TreatmentStatus;
  isVerified: boolean;
  isActive: boolean;
  isOnboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginData = {
  accessToken: string;
  expiresIn: number;
  user: AuthSessionUser;
};

export type UpdateUserProfileRequest = {
  fullName?: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
};

export type PushTokenRequest = {
  token: string;
};

export type PmoContactRequest = {
  name: string;
  relationship?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email: string;
};

export type PatientOnboardingRequest = {
  diagnosisDate: string;
  medicineTime: string;
  treatmentStartDate?: string;
  hasDroppedBefore?: boolean;
  previousTreatmentNote?: string;
  pmo?: PmoContactRequest;
};

export type UpdatePatientProfileRequest = {
  medicineTime?: string;
  treatmentStartDate?: string;
  previousTreatmentNote?: string;
};

export type PatientPmo = {
  id: string;
  name: string;
  relationship: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  email: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt?: string;
};

export type PatientProfile = {
  id: string;
  userId: string;
  diagnosisDate: string;
  medicineTime: string;
  treatmentStartDate: string | null;
  estimatedTreatmentEndDate: string | null;
  treatmentDayCount: number;
  treatmentDurationMonths: number;
  hasDroppedBefore: boolean;
  previousTreatmentNote: string | null;
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  totalMissedDays: number;
  pmos: PatientPmo[];
  createdAt?: string;
  updatedAt?: string;
};

export type PatientCheckin = {
  id: string;
  patientId: string;
  checkinDate: string;
  createdAt: string;
};

export type Symptom = {
  id: string;
  name: string;
};

export type CheckinSymptom = {
  symptomId: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  note?: string;
};

export type CreateCheckinRequest = {
  hasTakenMedicine: boolean;
  hasComplaint: boolean;
  takenAt?: string;
  skippedReason?: string;
  generalNote?: string;
  symptoms?: CheckinSymptom[];
};

export type PatientDashboard = {
  treatmentDayCount: number;
  treatmentDurationMonths: number;
  estimatedTreatmentEndDate: string | null;
  medicineTime: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  totalMissedDays: number;
  todayCheckin: PatientCheckin | null;
  latestAssessment: null;
  stockAlert: null;
  recentBadge: null;
};

export type CreatePmoRequest = PmoContactRequest;

export type UpdatePmoRequest = Partial<PmoContactRequest> & {
  isPrimary?: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type MedicineStock = {
  id: string;
  patientId: string;
  medicineName: string;
  medicineType: string | null;
  quantity: number;
  unit: string;
  dailyDose: number;
  thresholdQuantity: number;
  daysRemaining: number;
  isBelowThreshold: boolean;
  sourceFacilityId: string | null;
  lastRestockAt: string | null;
  nextEstimatedEmptyDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMedicineStockRequest = {
  medicineName: string;
  medicineType?: string;
  quantity: number;
  unit?: string;
  dailyDose: number;
  thresholdQuantity?: number;
};

export type UpdateMedicineStockRequest = {
  medicineName?: string;
  medicineType?: string;
  unit?: string;
  dailyDose?: number;
  thresholdQuantity?: number;
};

export type RestockMedicineRequest = {
  quantity: number;
  note?: string;
};

export type HealthDependency = {
  status: "up" | "down" | "disabled";
};

export type HealthData = {
  status: "ok" | "degraded";
  api: HealthDependency;
  mongodb: HealthDependency;
  redis: HealthDependency;
};

export type HealthFacilitySummary = {
  id: string;
  name: string;
  facilityType: string;
  address: string;
  city: string;
  province: string;
  phoneNumber: string | null;
  latitude: number;
  longitude: number;
  isTbServiceAvailable: boolean;
};

export type NearbyFacility = HealthFacilitySummary & {
  distanceKm: number;
};

export type FacilityDetail = HealthFacilitySummary & {
  operatingHours: string | null;
  source: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetFacilitiesParams = {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  facilityType?: string;
  isTbServiceAvailable?: boolean;
  sortBy?: "name" | "city" | "facilityType" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type GetNearbyParams = {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
  isTbServiceAvailable?: boolean;
};
