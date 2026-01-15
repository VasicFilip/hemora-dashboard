import { QueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import type {
  AnalyzeResponse,
  PatientResponse,
  PatientCreate,
  PatientUpdate,
  LabTestResponse,
  LabTestCreate,
  ReportDetailResponse,
  MarkerInput,
  PaginatedResponse,
  UploadUrlResponse,
  AnalysisUploadRequest,
  AnalysisUploadResponse,
  AnalysisStatusResponse,
  AnalysisResponse,
  AnalysisResultResponse,
  AnalysisContextCreate,
  AnalysisContextResponse,
  AnalysisListItem,
  MarkerDefinition,
  MarkersListResponse,
  MarkerCategory,
  ShareCreateRequest,
  ShareResponse,
  SharedReportResponse,
  UserCreate,
  UserUpdate,
  UserResponse,
  ClinicianCreate,
  OrganizationSettings,
  SettingsUpdate,
  AnalyticsStats,
  TimeSeriesPoint,
  DistributionPoint,
  SystemUsageStats,
  CreateOrganizationRequest,
  OrganizationResponse,
} from '@/types'

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create Query Client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
})

// Auth token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return Cookies.get('auth_token') || null
}

export const setAuthToken = (token: string): void => {
  Cookies.set('auth_token', token, {
    httpOnly: false, // Note: For true httpOnly, this needs to be set server-side
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 7 // 7 days
  })
}

export const removeAuthToken = (): void => {
  Cookies.remove('auth_token')
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return Cookies.get('refresh_token') || null
}

export const setRefreshToken = (token: string): void => {
  Cookies.set('refresh_token', token, {
    httpOnly: false, // Note: For true httpOnly, this needs to be set server-side
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 30 // 30 days
  })
}

export const removeRefreshToken = (): void => {
  Cookies.remove('refresh_token')
}

// API Error types
export interface APIError {
  detail?: Array<{
    loc: Array<string | number>
    msg: string
    type: string
  }>
  message?: string
}

// Custom API Error class
export class ApiError extends Error {
  status: number
  data: APIError

  constructor(status: number, data: APIError) {
    super(data.message || 'API Error')
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

// ============================================================================
// REQUEST DEDUPLICATION & TOKEN REFRESH
// ============================================================================

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>()

// Token refresh state
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

// Fetch wrapper with auth, error handling, and request deduplication
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const method = options.method || 'GET'

  // Create unique request key for deduplication
  // Only deduplicate GET requests to avoid issues with mutations
  const shouldDeduplicate = method === 'GET'
  const requestKey = shouldDeduplicate ? `${method}:${endpoint}` : null

  // Check if identical request is already in flight
  if (requestKey && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!
  }

  const requestPromise = (async () => {
    try {
      const token = getAuthToken()

      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        let errorData: APIError = { message: 'Unknown error occurred' }

        try {
          errorData = await response.json()
        } catch {
          // If JSON parsing fails, use default error
          errorData = { message: response.statusText }
        }

        // Handle unauthorized - attempt token refresh
        if (response.status === 401 && token) {
          const refreshSuccess = await refreshAuthToken()
          if (refreshSuccess) {
            // Retry original request with new token
            // Remove from cache first to allow retry
            if (requestKey) {
              pendingRequests.delete(requestKey)
            }
            return apiRequest<T>(endpoint, options)
          } else {
            // Refresh failed, redirect to login
            removeAuthToken()
            removeRefreshToken()
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
          }
        }

        throw new ApiError(response.status, errorData)
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network or other errors
      throw new ApiError(0, {
        message: error instanceof Error ? error.message : 'Network error'
      })
    } finally {
      // Clean up request from cache
      if (requestKey) {
        pendingRequests.delete(requestKey)
      }
    }
  })()

  // Cache the request promise if deduplication is enabled
  if (requestKey) {
    pendingRequests.set(requestKey, requestPromise)
  }

  return requestPromise
}

// Enhanced token refresh logic with request queuing
async function refreshAuthToken(): Promise<boolean> {
  // If already refreshing, wait for that refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return false

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) return false

      const data = await response.json()
      setAuthToken(data.access_token)

      if (data.refresh_token) {
        setRefreshToken(data.refresh_token)
      }

      return true
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// Multipart form data helper for file uploads
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const config: RequestInit = {
    ...options,
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    body: formData,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorData: APIError = { message: 'Upload failed' }

      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }

      throw new ApiError(response.status, errorData)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(0, {
      message: error instanceof Error ? error.message : 'Upload error'
    })
  }
}

// API endpoint helpers
export const api = {
  // Authentication
  login: (data: { email: string; password: string }) =>
    apiRequest<{ access_token: string; refresh_token: string; token_type: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    apiRequest<{ access_token: string; refresh_token: string; token_type: string }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  // User management
  getMe: () =>
    apiRequest<{
      email: string
      name: string
      role: string
      id: string
      is_active: boolean
      created_at: string
      organization_id: string
    }>("/api/auth/me"),

  // Patients
  // Patients
  getPatients: (params?: { page?: number; page_size?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.search) searchParams.append('search', params.search)

    const queryString = searchParams.toString()
    return apiRequest<PaginatedResponse<PatientResponse>>(`/api/patients${queryString ? `?${queryString}` : ''}`)
  },

  getPatient: (id: string) =>
    apiRequest<PatientResponse>(`/api/patients/${id}`),

  createPatient: (data: PatientCreate) =>
    apiRequest<PatientResponse>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePatient: (id: string, data: PatientUpdate) =>
    apiRequest<PatientResponse>(`/api/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePatient: (id: string) =>
    apiRequest<{}>(`/api/patients/${id}`, {
      method: 'DELETE',
    }),

  // Lab Tests (Legacy/Admin)
  getLabTests: (params?: { page?: number; page_size?: number; patient_id?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.patient_id) searchParams.append('patient_id', params.patient_id)
    const queryString = searchParams.toString()
    return apiRequest<PaginatedResponse<LabTestResponse>>(`/api/labtests${queryString ? `?${queryString}` : ''}`)
  },

  createLabTest: (data: LabTestCreate) =>
    apiRequest<LabTestResponse>('/api/labtests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reports (Legacy/Browse)
  getReports: (params?: { page?: number; page_size?: number; patient_id?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.patient_id) searchParams.append('patient_id', params.patient_id)

    const queryString = searchParams.toString()
    return apiRequest<PaginatedResponse<ReportDetailResponse>>(`/api/reports${queryString ? `?${queryString}` : ''}`)
  },

  getReport: (id: string) =>
    apiRequest<ReportDetailResponse>(`/api/reports/${id}`),

  // --- NEW MODULAR ANALYSIS FLOW ---

  getUploadUrl: (filename: string, patientId: string, mimetype: string) =>
    apiRequest<UploadUrlResponse>(`/api/analyses/upload/url?filename=${encodeURIComponent(filename)}&patient_id=${patientId}&mimetype=${encodeURIComponent(mimetype)}`, {
      method: 'POST'
    }),

  registerAnalysis: (data: AnalysisUploadRequest) =>
    apiRequest<AnalysisUploadResponse>('/api/analyses/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAnalysisStatus: (analysisId: string) =>
    apiRequest<AnalysisStatusResponse>(`/api/analyses/${analysisId}/status`),

  getAnalysis: (analysisId: string) =>
    apiRequest<AnalysisResponse>(`/api/analyses/${analysisId}`),

  updateExtracted: (analysisId: string, data: {
    extracted_json?: any
    lab_name?: string
    test_date?: string
    notes?: string
    patient_context?: any
  }) =>
    apiRequest<{ message: string; analysis_id: string }>(`/api/analyses/${analysisId}/extracted`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateAnalysisContext: (analysisId: string, data: AnalysisContextCreate) =>
    apiRequest<AnalysisContextResponse>(`/api/analyses/${analysisId}/context`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  triggerAnalysis: (analysisId: string) =>
    apiRequest<AnalysisStatusResponse>(`/api/analyses/${analysisId}/analyze`, {
      method: 'POST',
    }),

  getAnalysisResult: (analysisId: string, view: 'patient' | 'clinician' = 'patient') =>
    apiRequest<AnalysisResultResponse>(`/api/analyses/${analysisId}/result?view=${view}`),

  downloadAnalysisPdf: async (analysisId: string, view: 'patient' | 'clinician' = 'patient') => {
    const url = `${API_BASE_URL}/api/analyses/${analysisId}/pdf?view=${view}`
    const token = getAuthToken()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download PDF')
    }

    return response.blob()
  },

  // Legacy File Upload & Analysis (Single shot)
  uploadAndAnalyzeLegacy: (formData: FormData) =>
    apiUpload<AnalyzeResponse>('/api/reports/upload/legacy', formData),

  // Manual Trigger Analysis
  analyzeManual: (data: {
    markers: MarkerInput[]
    patient_id: string
    lab_name?: string
    test_date?: string
  }) =>
    apiRequest<AnalyzeResponse>('/api/analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ============================================================================
  // LAB TESTS - Additional Endpoints
  // ============================================================================

  getPatientLabTests: (patientId: string, params?: { page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    const queryString = searchParams.toString()
    return apiRequest<PaginatedResponse<LabTestResponse>>(
      `/api/labtests/patient/${patientId}${queryString ? `?${queryString}` : ''}`
    )
  },

  getLabTest: (labTestId: string) =>
    apiRequest<LabTestResponse>(`/api/labtests/${labTestId}`),

  // ============================================================================
  // ANALYSES - Additional Endpoints
  // ============================================================================

  getAnalyses: (params?: {
    patient_id?: string
    status_filter?: string
    page?: number
    page_size?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.patient_id) searchParams.append('patient_id', params.patient_id)
    if (params?.status_filter) searchParams.append('status_filter', params.status_filter)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    const queryString = searchParams.toString()
    return apiRequest<PaginatedResponse<AnalysisListItem>>(
      `/api/analyses${queryString ? `?${queryString}` : ''}`
    )
  },

  getAnalysisContext: (analysisId: string) =>
    apiRequest<AnalysisContextResponse | null>(`/api/analyses/${analysisId}/context`),

  deleteAnalysisContext: (analysisId: string) =>
    apiRequest<void>(`/api/analyses/${analysisId}/context`, {
      method: 'DELETE',
    }),

  retryAnalysis: (analysisId: string) =>
    apiRequest<AnalysisStatusResponse>(`/api/analyses/${analysisId}/retry`, {
      method: 'POST',
    }),

  // ============================================================================
  // MARKERS - Reference Data
  // ============================================================================

  getMarkers: (params?: { category?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)
    const queryString = searchParams.toString()
    return apiRequest<MarkersListResponse>(`/api/markers${queryString ? `?${queryString}` : ''}`)
  },

  getMarker: (code: string) =>
    apiRequest<MarkerDefinition>(`/api/markers/${code}`),

  getMarkerCategories: () =>
    apiRequest<MarkerCategory[]>(`/api/markers/categories/list`),

  // ============================================================================
  // SHARE - Report Sharing
  // ============================================================================

  createShareToken: (data: ShareCreateRequest) =>
    apiRequest<ShareResponse>('/api/share', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSharedReport: (token: string) =>
    apiRequest<SharedReportResponse>(`/api/share/${token}`),

  revokeShareToken: (token: string) =>
    apiRequest<void>(`/api/share/${token}`, {
      method: 'DELETE',
    }),

  // ============================================================================
  // ADMIN - User & Organization Management
  // ============================================================================

  adminSignup: (data: {
    email: string
    password: string
    full_name: string
    organization_name: string
    admin_secret: string
  }) =>
    apiRequest<{ message: string; user_id: string }>('/api/admin/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUsers: (params?: { page?: number; page_size?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.search) searchParams.append('search', params.search)
    const queryString = searchParams.toString()
    return apiRequest<PaginatedResponse<UserResponse>>(
      `/api/admin/users${queryString ? `?${queryString}` : ''}`
    )
  },

  createUser: (data: UserCreate) =>
    apiRequest<UserResponse>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUser: (userId: string) =>
    apiRequest<UserResponse>(`/api/admin/users/${userId}`),

  updateUser: (userId: string, data: UserUpdate) =>
    apiRequest<UserResponse>(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  createClinician: (data: ClinicianCreate) =>
    apiRequest<{ message: string; user_id: string; organization_id: string }>('/api/admin/clinicians', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: string) =>
    apiRequest<{ message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  getOrganizationSettings: () =>
    apiRequest<OrganizationSettings>('/api/admin/settings'),

  updateOrganizationSettings: (data: SettingsUpdate) =>
    apiRequest<OrganizationSettings>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ============================================================================
  // REPORTS - PDF Generation
  // ============================================================================

  downloadReportPdf: async (reportId: string, view: 'patient' | 'clinician' = 'patient') => {
    const url = `${API_BASE_URL}/api/reports/${reportId}/pdf?view=${view}`
    const token = getAuthToken()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download PDF')
    }

    return response.blob()
  },

  // Logout endpoint
  logout: () =>
    apiRequest<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  // Create organization (Onboarding)
  createOrganization: (data: CreateOrganizationRequest) =>
    apiRequest<OrganizationResponse>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  analytics: {
    getStats: (view: 'admin' | 'clinician' = 'admin') =>
      apiRequest<AnalyticsStats>(`/api/analytics/stats?view=${view}`),

    getActivity: (days: number = 30, view: 'admin' | 'clinician' = 'admin') =>
      apiRequest<TimeSeriesPoint[]>(`/api/analytics/activity?days=${days}&view=${view}`),

    getDistribution: (type: 'status' | 'source' | 'role', view: 'admin' | 'clinician' = 'admin') =>
      apiRequest<DistributionPoint[]>(`/api/analytics/distribution?type=${type}&view=${view}`),

    getRiskProfile: (view: 'admin' | 'clinician' = 'admin') =>
      apiRequest<DistributionPoint[]>(`/api/analytics/risk-profile?view=${view}`),

    getSystemUsage: () =>
      apiRequest<SystemUsageStats>('/api/analytics/system-usage'),
  },
}
