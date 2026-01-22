"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { z } from "zod"
import {
  Upload, FileText, CheckCircle, AlertCircle, X, Loader2, ArrowRight, Dna,
  Activity, Pill, Stethoscope, Wine, Cigarette, Dumbbell,
  Search, UserPlus, Scale, Ruler, Globe, Beaker, AlertTriangle, Settings2, Save,
  History as HistoryIcon, Trash2, ChevronRight, ChevronLeft, Check, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  usePatients,
  useCreatePatient,
  useGetUploadUrl,
  useRegisterAnalysis,
  useAnalysisStatus,
  useAnalysis,
  useUpdateExtracted,
  useUpdateAnalysisContext,
  useTriggerAnalysis
} from "@/lib/hooks"
import {
  AnalysisStatus,
  PatientResponse,
  PatientCreate,
  AnalysisContextCreate,
  Biomarker
} from "@/types"
import { showToast } from "@/lib/utils"

interface UploadStep {
  id: number
  title: string
  description: string
  completed: boolean
}

const steps: UploadStep[] = [
  { id: 1, title: "Upload Your Test", description: "PDF or Image (Max 10MB)", completed: false },
  { id: 2, title: "Add Profile Data", description: "Patient and medical info", completed: false },
  { id: 3, title: "Update Data", description: "Verify extracted values", completed: false },
  { id: 4, title: "Get Report", description: "View results", completed: false }
]

// Zod Schemas
const uploadPatientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").trim(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).transform(v => v === "" ? undefined : v),
  gender: z.enum(["Male", "Female", "Other"]),
})

const uploadContextSchema = z.object({
  weight_kg: z.number().positive("Weight must be positive").optional(),
  height_cm: z.number().positive("Height must be positive").optional(),
  body_type: z.string().optional(),
  smoker: z.string().optional(),
  pack_years: z.number().nonnegative().optional(),
  alcohol: z.string().optional(),
  alcohol_frequency: z.string().optional(),
  sport: z.string().optional(),
  sport_frequency: z.string().optional(),
  conditions: z.string().max(1000, "Conditions text too long").trim().optional(),
  medications: z.string().max(1000, "Medications text too long").trim().optional(),
  notes: z.string().max(2000, "Notes text too long").trim().optional(),
})

const SUPPORTED_LANGUAGES = [
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "ar", label: "Arabic (RTL)", flag: "🇸🇦" },
  { code: "fa", label: "Persian (RTL)", flag: "🇮🇷" },
  { code: "ku", label: "Kurdish (RTL)", flag: "☀️" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "pl", label: "Polish", flag: "🇵🇱" },
  { code: "ro", label: "Romanian", flag: "🇷🇴" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "hu", label: "Hungarian", flag: "🇭🇺" },
]

export default function UploadPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [preferredLanguage, setPreferredLanguage] = useState<string>("de")
  const [isCreatingPatient, setIsCreatingPatient] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // API Hooks
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients({ page_size: 100 })
  const createPatientMutation = useCreatePatient()
  const getUploadUrlMutation = useGetUploadUrl()
  const registerAnalysisMutation = useRegisterAnalysis()
  const { data: analysisStatus } = useAnalysisStatus(analysisId || "")
  const { data: analysisData, refetch: refetchAnalysis } = useAnalysis(analysisId || "")
  const updateExtractedMutation = useUpdateExtracted(analysisId || "")
  const updateContextMutation = useUpdateAnalysisContext(analysisId || "")
  const triggerAnalysisMutation = useTriggerAnalysis(analysisId || "")

  // Refetch analysis data when status becomes ready (extraction done)
  useEffect(() => {
    if (analysisStatus?.status === AnalysisStatus.REVIEW_READY) {
      refetchAnalysis()
    }
  }, [analysisStatus?.status, refetchAnalysis])

  // Patient creation form
  const [patientForm, setPatientForm] = useState<PatientCreate>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "Male",
  })

  // Analysis context form
  const [contextForm, setContextForm] = useState<AnalysisContextCreate>({
    weight_kg: undefined,
    height_cm: undefined,
    body_type: "average",
    smoker: "No",
    pack_years: undefined,
    alcohol: "No",
    alcohol_frequency: undefined,
    sport: "No",
    sport_frequency: undefined,
    conditions: "",
    medications: "",
    notes: "",
  })

  // Patient detailed profile (DOB, Gender, etc.)
  const [patientProfileMeta, setPatientProfileMeta] = useState<{
    dateOfBirth: string,
    gender: string
  }>({
    dateOfBirth: "",
    gender: "Male"
  })

  // Populate profile data when patient is selected
  useEffect(() => {
    if (selectedPatientId && patientsData?.data) {
      const p = patientsData.data.find(p => p.id === selectedPatientId)
      if (p) {
        setPatientProfileMeta({
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : "",
          gender: p.gender || "Male"
        })
      }
    } else if (isCreatingPatient) {
      // If creating, use form data
      setPatientProfileMeta({
        dateOfBirth: "", // If we had DOB in create form, we'd use it. currently we don't ask for DOB in quick create
        gender: patientForm.gender || "Male"
      })
    }
  }, [selectedPatientId, patientsData, isCreatingPatient, patientForm.gender])

  // Biomarkers state (for editing)
  const [localMarkers, setLocalMarkers] = useState<any[]>([])

  // Watch analysisData to populate localMarkers
  useEffect(() => {
    if (analysisData?.extracted_json?.markers) {
      // Parse ref_range into ref_min and ref_max if needed
      const processedMarkers = analysisData.extracted_json.markers.map((m: any) => {
        let ref_min = m.ref_min ?? m.reference_min ?? m.ref_low
        let ref_max = m.ref_max ?? m.reference_max ?? m.ref_high

        // If min/max are still undefined, try to parse from ref_range
        if ((ref_min === undefined || ref_max === undefined) && m.ref_range) {
          const parts = m.ref_range.split('-').map((s: string) => parseFloat(s.trim()))
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            ref_min = parts[0]
            ref_max = parts[1]
          }
        }

        return {
          ...m,
          ref_min,
          ref_max
        }
      })
      setLocalMarkers(processedMarkers)
    }
  }, [analysisData])

  // Polling/Transition Logic
  useEffect(() => {
    if (analysisStatus?.status === AnalysisStatus.REVIEW_READY && currentStep === 2) {
      // Stay in Step 2 until user clicks continue? 
      // Actually, if we are in Step 2 and extraction finishes, we just wait for user to confirm profile.
    }
    if (analysisStatus?.status === AnalysisStatus.ANALYZED && currentStep === 3) {
      router.push(`/results/${analysisId}`)
    }
  }, [analysisStatus, currentStep, analysisId, router])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast.error("File size exceeds 10MB limit")
      return
    }

    setUploadedFile(file)
  }

  const startModularUpload = async (file: File, pId: string) => {
    try {
      showToast.loading("Preparing upload...")
      const urlData = await getUploadUrlMutation.mutateAsync({
        filename: file.name,
        patientId: pId,
        mimetype: file.type
      })

      showToast.loading("Uploading file...")
      const response = await fetch(urlData.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!response.ok) throw new Error("File upload failed")

      showToast.loading("Registering analysis...")
      const regData = await registerAnalysisMutation.mutateAsync({
        file_path: urlData.file_path,
        patient_id: pId,
        mimetype: file.type,
        preferred_language: preferredLanguage
      })

      setAnalysisId(regData.analysis_id)
      setCurrentStep(2)
      showToast.success("Upload successful", "Extraction has started in background")
    } catch (error) {
      showToast.apiError(error, "Process failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePatientSubmit = async () => {
    if (isProcessing) return
    try {
      setIsProcessing(true)
      let pId = selectedPatientId
      if (isCreatingPatient) {
        // Validate Patient Form
        const validation = uploadPatientSchema.safeParse(patientForm)
        if (!validation.success) {
          showToast.error("Validation Error", validation.error.issues[0].message)
          return
        }

        const newPatient = await createPatientMutation.mutateAsync(validation.data as any) // Cast as any because schema transforms might slightly mismatch strict type but are compatible
        pId = newPatient.id
        setSelectedPatientId(pId)
      }

      if (!pId) {
        showToast.error("Please select or create a patient")
        return
      }

      if (uploadedFile) {
        await startModularUpload(uploadedFile, pId)
      }
    } catch (error) {
      showToast.apiError(error, "Failed to save patient")
      setIsProcessing(false)
    }
  }

  const handleContextSubmit = async () => {
    if (!analysisId || isProcessing) return
    try {
      setIsProcessing(true)
      // Validate Context Form
      const validation = uploadContextSchema.safeParse({
        ...contextForm,
        // Pre-convert strings to numbers for validation if they are set
        weight_kg: contextForm.weight_kg ? Number(contextForm.weight_kg) : undefined,
        height_cm: contextForm.height_cm ? Number(contextForm.height_cm) : undefined,
        pack_years: contextForm.pack_years ? Number(contextForm.pack_years) : undefined,
      })

      if (!validation.success) {
        showToast.error("Validation Error", validation.error.issues[0].message)
        return
      }

      // Append extra UI fields to notes for backend
      // ... rest of logic
      let noteContent = contextForm.notes || ""
      // Sanitize/Format payload
      const payload: AnalysisContextCreate = {
        ...contextForm,
        notes: noteContent.trim(),
        smoker: contextForm.smoker?.toLowerCase(),
        alcohol: contextForm.alcohol?.toLowerCase(),
        sport: contextForm.sport?.toLowerCase(),
        // Ensure numbers are numbers
        pack_years: contextForm.pack_years ? Number(contextForm.pack_years) : undefined,
        weight_kg: contextForm.weight_kg ? Number(contextForm.weight_kg) : undefined,
        height_cm: contextForm.height_cm ? Number(contextForm.height_cm) : undefined,
      }

      await updateContextMutation.mutateAsync(payload)
      setCurrentStep(3)
    } catch (error) {
      showToast.apiError(error, "Failed to save profile data")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateMarker = (index: number, field: string, value: any) => {
    const updated = [...localMarkers]
    updated[index] = { ...updated[index], [field]: value }
    setLocalMarkers(updated)
  }

  const handleDeleteMarker = (index: number) => {
    setLocalMarkers(localMarkers.filter((_, i) => i !== index))
  }

  const handleAddMarker = () => {
    setLocalMarkers([...localMarkers, { name: "", value: "", unit: "", category: "Unknown" }])
  }

  const handleSaveMarkers = async () => {
    if (!analysisId) return
    try {
      await updateExtractedMutation.mutateAsync({
        extracted_json: {
          ...analysisData?.extracted_json,
          markers: localMarkers
        }
      })
      showToast.success("Markers saved")
    } catch (error) {
      showToast.apiError(error, "Failed to save markers")
    }
  }

  const handleAnalysisTrigger = async () => {
    if (!analysisId || isProcessing) return
    try {
      setIsProcessing(true)
      // First save markers to be sure
      await updateExtractedMutation.mutateAsync({
        extracted_json: {
          ...analysisData?.extracted_json,
          markers: localMarkers
        }
      })
      await triggerAnalysisMutation.mutateAsync()
      showToast.success("Analysis started", "We'll redirect you shortly")
    } catch (error) {
      showToast.apiError(error, "Failed to start analysis")
    } finally {
      setIsProcessing(false)
    }
  }

  // Grouped markers for Step 3
  const groupedMarkers = useMemo(() => {
    const groups: Record<string, any[]> = {}
    localMarkers.forEach((m, i) => {
      const cat = m.category || "Unknown"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push({ ...m, originalIndex: i })
    })
    return groups
  }, [localMarkers])

  console.log("groupedMarkers", groupedMarkers)

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Blood Analysis Dashboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload report, provide context, and get premium clinical insights.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex justify-between mb-12 relative px-4">
        {/* Progress Line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-muted rounded-full -z-10">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id
                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-background border-muted text-muted-foreground"
                }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <span className="text-sm font-bold">{step.id}</span>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className={`text-sm font-semibold transition-colors ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                }`}>
                {step.title}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="mt-8 transition-all duration-500">

        {/* STEP 1: UPLOAD & PATIENT SELECT */}
        {currentStep === 1 && (
          <Card className="border-primary/10 shadow-xl shadow-primary/5 overflow-hidden border-2 p-0">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 pb-8">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                Upload Lab Report
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Start by identifying the patient and uploading their blood test results.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {/* Patient Selection Segment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Patient Information</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => setIsCreatingPatient(!isCreatingPatient)}
                  >
                    {isCreatingPatient ? (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Select Existing
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Patient
                      </>
                    )}
                  </Button>
                </div>

                {isCreatingPatient ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-primary/[0.02] rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={patientForm.firstName}
                        onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={patientForm.lastName}
                        onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={patientForm.email}
                        onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Biological Sex</Label>
                      <Select
                        value={patientForm.gender}
                        onValueChange={(val) => setPatientForm({ ...patientForm, gender: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Select
                      value={selectedPatientId}
                      onValueChange={setSelectedPatientId}
                    >
                      <SelectTrigger className="pl-10 h-12 text-lg border-2 focus:border-primary/50 transition-all">
                        <SelectValue placeholder="Search or select patient..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {patientsData?.data.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} <span className="text-muted-foreground text-sm ml-2">({p.email || 'No email'})</span>
                          </SelectItem>
                        ))}
                        {patientsData?.data.length === 0 && !isLoadingPatients && (
                          <div className="p-4 text-center text-muted-foreground">No patients found. Create one!</div>
                        )}
                        {isLoadingPatients && (
                          <div className="p-4 flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading patients...
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Language Selection Segment */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Report Language</Label>
                </div>
                <Select
                  value={preferredLanguage}
                  onValueChange={setPreferredLanguage}
                >
                  <SelectTrigger className="h-12 border-2 focus:border-primary/50 transition-all">
                    <SelectValue placeholder="Select report language..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground ml-1">
                  This sets the LLM simplification language and PDF layout (RTL support for Arabic/Persian/Kurdish).
                </p>
              </div>

              {/* File Upload Segment */}
              <div className="space-y-4 pt-4">
                <Label className="text-lg font-medium">Test Report</Label>
                <div className="group relative">
                  <div className={`
                    border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${uploadedFile
                      ? "border-primary bg-primary/[0.03] border-solid"
                      : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/[0.01]"
                    }
                  `}>
                    <input
                      type="file"
                      id="file-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      accept=".pdf,image/*"
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className={`p-4 rounded-full transition-all duration-300 ${uploadedFile ? "bg-primary text-primary-foreground" : "bg-primary/5 text-primary group-hover:scale-110"}`}>
                        {uploadedFile ? <FileText className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                      </div>
                      <div>
                        {uploadedFile ? (
                          <>
                            <p className="text-lg font-semibold text-primary">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-semibold">Click or drag report here</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Supports PDF, PNG, JPG (Max 10MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {uploadedFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/[0.02] border-t border-primary/5 p-8 flex justify-end">
              <Button
                size="lg"
                className="h-12 px-10 text-lg shadow-lg shadow-primary/20 transition-all hover:translate-x-1"
                disabled={!uploadedFile || (!selectedPatientId && !isCreatingPatient) || registerAnalysisMutation.isPending || createPatientMutation.isPending || isProcessing}
                onClick={handlePatientSubmit}
              >
                {registerAnalysisMutation.isPending || createPatientMutation.isPending || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 2: PROFILE DATA (Matching Screenshot 1) */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="border-primary/10 shadow-xl overflow-hidden border-2">
              <CardHeader className="bg-primary/[0.02] border-b border-primary/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Add Profile Data</CardTitle>
                  <CardDescription>Refine the patient's medical profile for more accurate analysis.</CardDescription>
                </div>
                {analysisStatus?.status === AnalysisStatus.EXTRACTING && (
                  <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5 animate-pulse">
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Extracting report...
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Bio Data Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                      <Dna className="h-4 w-4" />
                      Biological Profile
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          className="h-11 border-muted-foreground/30 focus:border-primary"
                          value={patientProfileMeta.dateOfBirth}
                          onChange={(e) => setPatientProfileMeta({ ...patientProfileMeta, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body Type</Label>
                        <Select onValueChange={(v) => setContextForm({ ...contextForm, body_type: v })} value={contextForm.body_type}>
                          <SelectTrigger className="h-11 border-muted-foreground/30"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="athletic">Athletic</SelectItem>
                            <SelectItem value="slim">Slim</SelectItem>
                            <SelectItem value="heavy">Heavy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Biological Sex</Label>
                      <Tabs
                        value={patientProfileMeta.gender}
                        onValueChange={(v) => setPatientProfileMeta({ ...patientProfileMeta, gender: v })}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-3 h-11 bg-muted/30 p-1">
                          <TabsTrigger value="Male" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">Male</TabsTrigger>
                          <TabsTrigger value="Female" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">Female</TabsTrigger>
                          <TabsTrigger value="Other" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">Other</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>



                  {/* Physical Metrics */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                      <Activity className="h-4 w-4" />
                      Physical Metrics
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="70"
                            className="h-11 pr-12"
                            value={contextForm.weight_kg}
                            onChange={(e) => setContextForm({ ...contextForm, weight_kg: Number(e.target.value) })}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">kg</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="175"
                            className="h-11 pr-12"
                            value={contextForm.height_cm}
                            onChange={(e) => setContextForm({ ...contextForm, height_cm: Number(e.target.value) })}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">cm</span>
                        </div>
                      </div>
                    </div>


                  </div>

                  {/* Lifestyle Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                      <Wine className="h-4 w-4" />
                      Lifestyle Factors
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col space-y-3 p-3 border border-muted-foreground/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium"><Cigarette className="w-4 h-4" /> Smoker?</div>
                          <div className="flex gap-2">
                            <Button
                              variant={contextForm.smoker === "Yes" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContextForm({ ...contextForm, smoker: "Yes" })}
                            >Yes</Button>
                            <Button
                              variant={contextForm.smoker === "No" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContextForm({ ...contextForm, smoker: "No" })}
                            >No</Button>
                          </div>
                        </div>
                        {contextForm.smoker === "Yes" && (
                          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-xs">Pack Years (Years x Packs/day)</Label>
                            <Input
                              type="number"
                              className="h-9 mt-1"
                              placeholder="e.g. 5"
                              value={contextForm.pack_years || ''}
                              onChange={(e) => setContextForm({ ...contextForm, pack_years: parseFloat(e.target.value) })}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-3 p-3 border border-muted-foreground/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium"><Wine className="w-4 h-4" /> Alcohol?</div>
                          <div className="flex gap-2">
                            <Button
                              variant={contextForm.alcohol === "Yes" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContextForm({ ...contextForm, alcohol: "Yes" })}
                            >Yes</Button>
                            <Button
                              variant={contextForm.alcohol === "No" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContextForm({ ...contextForm, alcohol: "No" })}
                            >No</Button>
                          </div>
                        </div>
                        {contextForm.alcohol === "Yes" && (
                          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-xs">Frequency</Label>
                            <Select onValueChange={(v) => setContextForm({ ...contextForm, alcohol_frequency: v })} value={contextForm.alcohol_frequency}>
                              <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rarely">Rarely</SelectItem>
                                <SelectItem value="socially">Socially (1-2/week)</SelectItem>
                                <SelectItem value="moderately">Moderately (3-4/week)</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-3 p-3 border border-muted-foreground/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium"><Dumbbell className="w-4 h-4" /> Active Sport?</div>
                          <div className="flex gap-2">
                            <Button
                              variant={contextForm.sport === "Yes" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContextForm({ ...contextForm, sport: "Yes" })}
                            >Yes</Button>
                            <Button
                              variant={contextForm.sport === "No" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContextForm({ ...contextForm, sport: "No" })}
                            >No</Button>
                          </div>
                        </div>
                        {contextForm.sport === "Yes" && (
                          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-xs">Frequency</Label>
                            <Select onValueChange={(v) => setContextForm({ ...contextForm, sport_frequency: v })} value={contextForm.sport_frequency}>
                              <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="occasionally">Occasionally</SelectItem>
                                <SelectItem value="regularly">Regularly (1-2/week)</SelectItem>
                                <SelectItem value="frequently">Frequently (3+/week)</SelectItem>
                                <SelectItem value="athlete">Professional/Athlete</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                      <Stethoscope className="h-4 w-4" />
                      Medical History
                    </div>

                    <div className="space-y-2">
                      <Label>Existing Conditions</Label>
                      <Textarea
                        className="min-h-[60px] border-muted-foreground/30"
                        placeholder="Hypertension, Diabetes, etc..."
                        value={contextForm.conditions || ''}
                        onChange={(e) => setContextForm({ ...contextForm, conditions: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Current Medications</Label>
                      <Textarea
                        className="min-h-[60px] border-muted-foreground/30"
                        placeholder="List any active medications..."
                        value={contextForm.medications || ''}
                        onChange={(e) => setContextForm({ ...contextForm, medications: e.target.value })}
                      />
                    </div>
                  </div>

                </div>

                <Separator className="my-8" />

                <div className="space-y-2 mt-6">
                  <Label>Additional Notes</Label>
                  <Textarea
                    className="min-h-[80px] border-muted-foreground/30"
                    placeholder="Any specific concerns or symptoms..."
                    value={contextForm.notes || ''}
                    onChange={(e) => setContextForm({ ...contextForm, notes: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-primary/[0.02] border-t border-primary/5 p-8 flex justify-between">
                <Button variant="outline" size="lg" onClick={() => setCurrentStep(1)} className="h-12">
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
                <div className="flex gap-4">
                  <Button variant="ghost" size="lg" onClick={() => setCurrentStep(3)} className="h-12">
                    Skip Profile
                  </Button>
                  <Button
                    size="lg"
                    className="h-12 px-10 text-lg shadow-lg shadow-primary/20"
                    onClick={handleContextSubmit}
                    disabled={updateContextMutation.isPending || isProcessing}
                  >
                    {updateContextMutation.isPending || isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Confirm Profile
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* STEP 3: UPDATE DATA (Marker Verification - Matching Screenshot 2 & 3) */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">

            {/* Show Polling/Status if still extracting */}
            {analysisStatus?.status === AnalysisStatus.EXTRACTING || analysisStatus?.status === AnalysisStatus.UPLOADED ? (
              <Card className="p-12 text-center space-y-8 border-2 shadow-xl">
                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full border-[6px] border-primary/10 border-t-primary animate-spin" />
                    <div className="h-20 w-20 absolute inset-0 m-auto bg-primary/5 rounded-full flex items-center justify-center">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold">Scanning Blood Report...</h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Our AI is digitizing your laboratory results. This usually takes around 30-60 seconds.
                    </p>
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <div className="bg-muted h-3 rounded-full overflow-hidden">
                      <div className="bg-primary h-full animate-[progress_15s_ease-in-out_infinite]" />
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                      <span>OCR Extraction</span>
                      <span>Mapping Values</span>
                      <span>Finalizing</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Update Data</h2>
                    <p className="text-muted-foreground text-lg">Verify and correct the extracted biomarkers before final analysis.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="h-12 gap-2 border-2" onClick={handleAddMarker}>
                      <Plus className="h-5 w-5" /> Add Marker
                    </Button>
                    <Button variant="outline" className="h-12 gap-2 border-2" onClick={handleSaveMarkers} disabled={updateExtractedMutation.isPending}>
                      {updateExtractedMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      Save Updates
                    </Button>
                    <Button
                      className="h-12 px-8 gap-2 shadow-xl shadow-primary/20 text-lg"
                      onClick={handleAnalysisTrigger}
                      disabled={triggerAnalysisMutation.isPending}
                    >
                      {triggerAnalysisMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Beaker className="h-5 w-5" />}
                      Deep Analysis
                    </Button>
                  </div>
                </div>

                {/* Marker Groups */}
                <div className="space-y-12 pb-20">
                  {Object.entries(groupedMarkers).map(([category, markers]) => (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {category === "Unknown" ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <Settings2 className="h-5 w-5 text-primary" />}
                          {category}
                        </h3>
                        <Badge variant="secondary" className="rounded-full px-3">{markers.length} Items</Badge>
                      </div>

                      <div className="grid gap-4">
                        {markers.map((marker) => (
                          <Card key={marker.originalIndex} className="border-primary/5 hover:border-primary/20 transition-all hover:shadow-md group">
                            <CardContent className="p-4 md:p-6">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

                                {/* Name Input */}
                                <div className="md:col-span-4 space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Biomarker Name</Label>
                                  <Input
                                    className="h-11 text-base font-semibold border-none bg-muted/30 focus-visible:bg-background transition-all"
                                    value={marker.name}
                                    placeholder="e.g. Hemoglobin"
                                    onChange={(e) => handleUpdateMarker(marker.originalIndex, "name", e.target.value)}
                                  />
                                </div>

                                {/* Value Input */}
                                <div className="md:col-span-2 space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Value</Label>
                                  <Input
                                    className={`h-11 text-center font-bold text-lg border-2 transition-all ${marker.status && marker.status !== 'Normal' ? 'border-destructive/30 text-destructive bg-destructive/5' : 'border-muted/50 focus-visible:border-primary/50'
                                      }`}
                                    value={marker.value}
                                    placeholder="0.0"
                                    onChange={(e) => handleUpdateMarker(marker.originalIndex, "value", e.target.value)}
                                  />
                                </div>

                                {/* Unit Input */}
                                <div className="md:col-span-2 space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Unit</Label>
                                  <Input
                                    className="h-11 text-center font-medium bg-muted/20 border-none opacity-80"
                                    value={marker.unit}
                                    placeholder="Unit"
                                    onChange={(e) => handleUpdateMarker(marker.originalIndex, "unit", e.target.value)}
                                  />
                                </div>

                                {/* Reference Range */}
                                <div className="md:col-span-3 space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Ref. Range</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      className="h-11 text-center bg-muted/20 border-none"
                                      value={marker.ref_min ?? ''}
                                      placeholder="Min"
                                      onChange={(e) => handleUpdateMarker(marker.originalIndex, "ref_min", e.target.value)}
                                    />
                                    <span className="text-muted-foreground font-bold">-</span>
                                    <Input
                                      className="h-11 text-center bg-muted/20 border-none"
                                      value={marker.ref_max ?? ''}
                                      placeholder="Max"
                                      onChange={(e) => handleUpdateMarker(marker.originalIndex, "ref_max", e.target.value)}
                                    />
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-1 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteMarker(marker.originalIndex)}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>

                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}

                  {localMarkers.length === 0 && (
                    <Card className="p-20 text-center border-dashed border-2 bg-muted/5">
                      <HistoryIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold">No results extracted</h3>
                      <p className="text-muted-foreground text-lg mt-2 max-w-sm mx-auto">
                        The scan didn't find any markers or the report is still processing. Try adding one manually.
                      </p>
                      <div className="flex gap-4 justify-center mt-8">
                        <Button variant="outline" className="h-12 px-6" onClick={handleAddMarker}>
                          <Plus className="h-5 w-5 mr-2" />
                          Add Manual Marker
                        </Button>
                        <Button variant="default" className="h-12 px-6" onClick={() => refetchAnalysis()}>
                          <HistoryIcon className="h-5 w-5 mr-2" />
                          Refresh Data
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Sticky Actions Bar */}
            {analysisStatus?.status !== AnalysisStatus.EXTRACTING && (
              <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-6 flex justify-center z-50">
                <div className="max-w-5xl w-full flex justify-between items-center gap-4">
                  <Button variant="outline" size="lg" onClick={() => setCurrentStep(2)} className="h-14 px-8 border-2">
                    <ChevronLeft className="mr-2 h-6 w-6" />
                    Back to Profile
                  </Button>
                  <Button
                    size="lg"
                    className="h-14 px-12 text-xl font-bold shadow-2xl shadow-primary/30 gap-2"
                    onClick={handleAnalysisTrigger}
                    disabled={triggerAnalysisMutation.isPending || !analysisId || isProcessing}
                  >
                    {triggerAnalysisMutation.isPending || isProcessing ? <Loader2 className="h-7 w-7 animate-spin" /> : <Beaker className="h-7 w-7" />}
                    Start Analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Background Micro-animations */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-blue-500/5 blur-[130px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          30% { width: 40%; }
          60% { width: 75%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  )
}