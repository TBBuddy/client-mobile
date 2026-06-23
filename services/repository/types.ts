export type UserRole = "PATIENT" | "SUPPORTER" | "ADMIN";
export type TreatmentStatus =
  | "NOT_PATIENT"
  | "ON_TREATMENT"
  | "RECOVERED"
  | "DROPPED"
  | "CANCELLED";
export type PatientProfileStatus =
  | "ACTIVE"
  | "RECOVERED"
  | "DROPPED"
  | "CANCELLED";

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
  hasActivePatientProfile: boolean;
  hasPatientHistory: boolean;
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
  status: PatientProfileStatus;
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
  endedAt: string | null;
  endedReason: string | null;
  pmos: PatientPmo[];
  createdAt?: string;
  updatedAt?: string;
};

export type PatientHistorySummary = {
  id: string;
  status: PatientProfileStatus;
  diagnosisDate: string;
  treatmentStartDate: string | null;
  estimatedTreatmentEndDate: string | null;
  endedAt: string | null;
  endedReason: string | null;
  treatmentDurationMonths: number;
  totalCheckins: number;
};

export type ClosePatientProfileRequest = {
  outcome: Extract<PatientProfileStatus, "RECOVERED" | "DROPPED" | "CANCELLED">;
  reason?: string;
};

export type PatientDashboard = {
  treatmentDayCount: number;
  treatmentDurationMonths: number;
  treatmentStartDate: string | null;
  estimatedTreatmentEndDate: string | null;
  medicineTime: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  totalMissedDays: number;
  stockDoses: number;
  hasCheckedInToday: boolean;
  todayCheckin: null;
  latestAssessment: null;
  stockAlert: null;
  recentBadge: null;
};

export type CreatePmoRequest = PmoContactRequest;

export type UpdatePmoRequest = Partial<PmoContactRequest> & {
  isPrimary?: boolean;
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

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
