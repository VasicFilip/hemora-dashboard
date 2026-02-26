// API Response Types matching backend schemas

export interface PatientResponse {
  firstName: string
  lastName: string
  email?: string
  dateOfBirth?: string
  phone?: string
  address?: string
  gender?: string
  id: string
  organization_id: string
  is_active?: boolean
  created_at: string
  updated_at: string
  lastAnalysisDate?: string
}

export interface PatientCreate {
  firstName: string
  lastName: string
  email?: string
  dateOfBirth?: string
  phone?: string
  address?: string
  gender?: string
}

export interface PatientUpdate {
  firstName?: string
  lastName?: string
  email?: string
  dateOfBirth?: string
  phone?: string
  address?: string
  gender?: string
  is_active?: boolean
}

export interface LabTestResponse {
  id: string
  patient_id: string
  test_date: string
  lab_name: string
  lab_reference?: string
  markers: MarkerInput[]
  notes?: string
  created_at: string
}

export interface LabTestCreate {
  patient_id: string
  test_date: string
  lab_name: string
  lab_reference?: string
  markers: MarkerInput[]
  notes?: string
}

export interface MarkerInput {
  code?: string
  name: string
  value: number
  unit: string
  referenceMin?: number
  referenceMax?: number
}

export interface ReportDetailResponse {
  id: string
  analysis_id: string
  lab_test_id: string
  patient_id: string
  status: string
  analysis_source?: string
  patient_view_json?: any
  clinician_view_json?: any
  created_at: string
  updated_at: string
  date?: string
  source?: string
  summary?: string
  patient?: PatientResponse
  markers?: MarkerInput[]
  insights?: string[]
  recommendations?: string[]
  relations?: any[]
  suggestedTests?: string[]
  lab_test?: LabTestResponse
}

export interface AnalysisContextCreate {
  weight_kg?: number
  height_cm?: number
  smoker?: string
  pack_years?: number
  alcohol?: string
  alcohol_frequency?: string
  sport?: string
  sport_frequency?: string
  body_type?: string
  conditions?: string
  medications?: string
  feeling?: string
  notes?: string
}

export interface AnalysisContextResponse extends AnalysisContextCreate {
  id: string
  analysis_id: string
  created_at: string
  updated_at: string
}

export interface UserResponse {
  email: string
  name: string
  role: string
  id: string
  is_active: boolean
  created_at: string
}

export interface UserMeResponse extends UserResponse {
  organization_id: string
  settings?: Record<string, any>
}


export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  new_password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AnalyzeResponse {
  report_id: string
  analysis_id: string
  status: string
  patient_view?: any
  clinician_view?: any
}

export interface AnalysisUploadRequest {
  file_path: string
  patient_id: string
  lab_name?: string
  test_date?: string
  notes?: string
  mimetype: string
  preferred_language?: string
}

export interface AnalysisUploadResponse {
  analysis_id: string
  status: string
  message: string
}

export interface UploadUrlResponse {
  upload_url: string
  file_path: string
  token?: string
}

export interface AnalysisStatusResponse {
  analysis_id: string
  status: string
  error_message?: string
}

export enum AnalysisStatus {
  UPLOADED = 'uploaded',
  EXTRACTING = 'extracting',
  REVIEW_READY = 'review_ready',
  ANALYZING = 'analyzing',
  ANALYZED = 'analyzed',
  FAILED = 'failed',
}

export interface AnalysisResponse {
  analysis_id: string
  patient_id: string
  status: string
  original_filename?: string
  mimetype?: string
  preferred_language?: string
  lab_name?: string
  test_date?: string
  notes?: string
  patient_context?: any
  extracted_json?: {
    markers: any[]
    lab_name?: string
    test_date?: string
    confidence?: number
  }
  extraction_confidence?: number
  result_json?: any
  analysis_source?: string
  error_message?: string
  created_at: string
}

export interface AnalysisResultResponse {
  analysis_id: string
  view: 'patient' | 'clinician'
  result: any // Rich BloodGPT format
  lab_name?: string
  test_date?: string
  analysis_source?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}

// Legacy types for gradual migration (will be removed eventually)
export interface Patient {
  id: string
  name: string
  age: number
  sex: 'Male' | 'Female' | 'Other'
  email: string
  phone?: string
  dateOfBirth: Date
  createdAt: Date
  lastAnalysisDate?: Date
  status: 'Normal' | 'Borderline' | 'Abnormal'
  analyses: Analysis[]
}

export interface Analysis {
  id: string
  patientId: string
  date: Date
  status: 'Normal' | 'Borderline' | 'Abnormal'
  reportUrl?: string
  biomarkers: Biomarker[]
  summary: string
  keyAbnormalities: string[]
  clinicalNotes: string
  testType: string
}

export interface Biomarker {
  id: string
  name: string
  value: number | string
  unit: string
  referenceMin?: number
  referenceMax?: number
  status: 'Normal' | 'High' | 'Low' | 'Critical'
  notes?: string
}

export interface PatientContext {
  weight?: number // kg
  height?: number // cm
  isSmoker?: 'Yes' | 'No' | 'Not specified'
  alcoholConsumption?: 'Yes' | 'No' | 'Not specified'
  exerciseRegularly?: 'Yes' | 'No' | 'Not specified'
  bodyType?: string
  preExistingConditions?: string
  medications?: string
  additionalNotes?: string
}

export interface UploadStep {
  id: number
  title: string
  description: string
  completed: boolean
}

// ============================================================================
// ADMIN & USER MANAGEMENT
// ============================================================================

export interface UserCreate {
  email: string
  password: string
  name: string
  role: 'admin' | 'clinician' | 'staff'
}

export interface ClinicianCreate {
  email: string
  name: string
  password: string
  organization_name: string
  organization_phone?: string
}

export interface UserUpdate {
  email?: string
  name?: string
  role?: 'admin' | 'clinician' | 'staff'
  is_active?: boolean
}

export interface OrganizationSettings {
  id: string
  name: string
  settings: Record<string, any>
}

export interface SettingsUpdate {
  name?: string
  settings?: Record<string, any>
}

// ============================================================================
// MARKERS REFERENCE
// ============================================================================

export interface MarkerDefinition {
  code: string
  name: string
  category: string
  unit: string
  ref_min: number
  ref_max: number
  what_it_is: string
  why_it_matters: string
}

export interface MarkersListResponse {
  markers: MarkerDefinition[]
  total: number
}

export interface MarkerCategory {
  code: string
  label: string
}

// ============================================================================
// SHARE TOKENS
// ============================================================================

export interface ShareCreateRequest {
  report_id: string
  expires_in_days: number
  max_views?: number
}

export interface ShareResponse {
  token: string
  expires_at: string
  share_url: string
}

export interface SharedReportResponse {
  report: any
  patient_name: string
  test_date: string
  lab_name: string
}

// ============================================================================
// ANALYSES LIST
// ============================================================================

export interface AnalysisListItem {
  analysis_id: string
  patient_id: string
  status: string
  lab_name: string | null
  test_date: string | null
  created_at: string
  marker_count: number
}

// ============================================================================
// AUTH & RBAC
// ============================================================================

export type UserRole = 'admin' | 'clinician' | 'staff'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  organization_id: string
  is_active: boolean
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface CreateOrganizationRequest {
  name: string
  email: string
  phone: string
  address: string
}

export interface OrganizationResponse {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AnalyticsStats {
  analyses_this_month: number
  total_patients: number
  pending_analyses: number
  total_organizations?: number
  total_users?: number
  total_analyses?: number
  total_reports?: number
  change_percentages?: {
    analyses: number
    patients: number
    reports: number
  }
}

export interface TimeSeriesPoint {
  date: string
  value: number
}

export interface DistributionPoint {
  label: string
  value: number
  id?: string
}

export interface SystemUsageStats {
  avg_processing_time_ms: number
  error_rate_pct: number
  api_status: 'Operational' | 'Degraded' | 'Down'
  database_status: 'Connected' | 'Disconnected'
  storage_status: 'Available' | 'Full' | 'Error'
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details?: Record<string, any>
  created_at: string
}