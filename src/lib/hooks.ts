'use client'

import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { api } from './api'
import { showToast } from './toast'
import type {
  PatientResponse,
  PatientCreate,
  PatientUpdate,
  LabTestResponse,
  LabTestCreate,
  ReportDetailResponse,
  UserResponse,
  TokenResponse,
  LoginRequest,
  PaginatedResponse,
  AnalyzeResponse,
  AnalysisUploadRequest,
  AnalysisStatusResponse,
  AnalysisContextCreate
} from '@/types'

// Query Keys
export const queryKeys = {
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  labTests: ['lab-tests'] as const,
  labTest: (id: string) => ['lab-tests', id] as const,
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,
  user: ['user'] as const,
}

// Auth Hooks
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => api.login(data),
    onSuccess: (response: TokenResponse) => {
      // Note: Token setting is handled in api.ts
      showToast.success('Logged in successfully', 'Welcome back!')
    },
    onError: (error) => {
      showToast.apiError(error, 'Login failed')
    },
  })
}

export function useUser(): UseQueryResult<UserResponse, Error> {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => api.getMe(),
    retry: (failureCount, error) => {
      // Don't retry if unauthorized
      if (error && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Patient Hooks
export function usePatients(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: [...queryKeys.patients, params],
    queryFn: () => api.getPatients(params),
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patient(id),
    queryFn: () => api.getPatient(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PatientCreate) => api.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients })
      showToast.success('Patient created', 'New patient has been successfully added')
    },
    onError: (error) => {
      showToast.apiError(error, 'Failed to create patient')
    },
  })
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PatientUpdate) => api.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patient(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.patients })
      showToast.success('Patient updated', 'Patient information has been saved')
    },
    onError: (error) => {
      showToast.apiError(error, 'Failed to update patient')
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients })
      showToast.success('Patient deleted', 'Patient has been removed from the system')
    },
    onError: (error) => {
      showToast.apiError(error, 'Failed to delete patient')
    },
  })
}

// Lab Test Hooks
export function useLabTests(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: [...queryKeys.labTests, params],
    queryFn: () => api.getLabTests(params),
  })
}

export function useCreateLabTest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LabTestCreate) => api.createLabTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labTests })
      queryClient.invalidateQueries({ queryKey: queryKeys.patients })
      showToast.success('Lab test created', 'New test results have been recorded')
    },
    onError: (error) => {
      showToast.apiError(error, 'Failed to create lab test')
    },
  })
}

// Report Hooks
export function useReports(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: [...queryKeys.reports, params],
    queryFn: () => api.getReports(params),
  })
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.report(id),
    queryFn: () => api.getReport(id),
    enabled: !!id,
  })
}

// Modular Analysis Hooks

export function useGetUploadUrl() {
  return useMutation({
    mutationFn: ({ filename, patientId, mimetype }: { filename: string, patientId: string, mimetype: string }) =>
      api.getUploadUrl(filename, patientId, mimetype),
  })
}

export function useRegisterAnalysis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AnalysisUploadRequest) => api.registerAnalysis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    }
  })
}

export function useAnalysisStatus(analysisId: string) {
  return useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => api.getAnalysisStatus(analysisId),
    enabled: !!analysisId,
    refetchInterval: (query) => {
      const data = query.state.data as AnalysisStatusResponse | undefined
      if (!data) return false
      // Poll if extracting or analyzing (every 5 seconds to reduce server load)
      if (data.status === 'extracting' || data.status === 'analyzing' || data.status === 'uploaded') {
        return 15000
      }
      return false
    }
  })
}

export function useAnalysis(analysisId: string) {
  return useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => api.getAnalysis(analysisId),
    enabled: !!analysisId,
  })
}

export function useUpdateExtracted(analysisId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      extracted_json?: any
      lab_name?: string
      test_date?: string
      notes?: string
      patient_context?: any
    }) => api.updateExtracted(analysisId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', analysisId] })
    }
  })
}

export function useUpdateAnalysisContext(analysisId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AnalysisContextCreate) => api.updateAnalysisContext(analysisId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-context', analysisId] })
      queryClient.invalidateQueries({ queryKey: ['analysis', analysisId] })
    }
  })
}

export function useTriggerAnalysis(analysisId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.triggerAnalysis(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-status', analysisId] })
      queryClient.invalidateQueries({ queryKey: ['analysis', analysisId] })
    }
  })
}

export function useAnalysisResult(analysisId: string, view: 'patient' | 'clinician' = 'patient') {
  return useQuery({
    queryKey: ['analysis-result', analysisId, view],
    queryFn: () => api.getAnalysisResult(analysisId, view),
    enabled: !!analysisId,
  })
}

// Optimistic Updates Helper
export function useOptimisticUpdate() {
  const queryClient = useQueryClient()

  return {
    addPatient: (newPatient: PatientResponse) => {
      queryClient.setQueryData(
        queryKeys.patients,
        (old: PaginatedResponse<PatientResponse> | undefined) => {
          if (!old) return { data: [newPatient], total: 1, page: 1, page_size: 10 }
          return {
            ...old,
            data: [newPatient, ...old.data],
            total: old.total + 1,
          }
        }
      )
    },

    updatePatient: (id: string, updatedData: PatientUpdate) => {
      queryClient.setQueryData(queryKeys.patient(id), (old: PatientResponse | undefined) => {
        if (!old) return old
        return { ...old, ...updatedData }
      })

      queryClient.setQueryData(
        queryKeys.patients,
        (old: PaginatedResponse<PatientResponse> | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(patient =>
              patient.id === id ? { ...patient, ...updatedData } : patient
            ),
          }
        }
      )
    },

    removePatient: (id: string) => {
      queryClient.setQueryData(
        queryKeys.patients,
        (old: PaginatedResponse<PatientResponse> | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(patient => patient.id !== id),
            total: old.total - 1,
          }
        }
      )
    }
  }
}

// Loading state helper
export function useLoadingStates() {
  const patients = usePatients()
  const reports = useReports()
  const labTests = useLabTests()

  return {
    isLoadingAny: patients.isLoading || reports.isLoading || labTests.isLoading,
    isErrorAny: patients.isError || reports.isError || labTests.isError,
    errors: [patients.error, reports.error, labTests.error].filter(Boolean),
  }
}
