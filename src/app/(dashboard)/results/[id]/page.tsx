"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Activity,
  Loader2,
  AlertTriangle,
  Microscope
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useAnalysisResult, useAnalysis } from "@/lib/hooks"
import { api } from "@/lib/api"
import { showToast } from "@/lib/utils"
import { toast } from "sonner"

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [viewMode, setViewMode] = useState<'patient' | 'clinician'>('patient')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState("overview")
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      toast.info("Generating high-quality PDF...")
      // Use stored language or default to German if missing (legacy)
      const lang = analysisMeta?.preferred_language || "de"
      const blob = await api.downloadAnalysisPdf(id, viewMode, lang)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hemora_report_${id}_${viewMode}_${lang}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Report downloaded")
    } catch (e) {
      console.error(e)
      toast.error("Failed to download report")
    } finally {
      setIsDownloading(false)
    }
  }


  // Fetch Data
  const {
    data: resultData,
    isLoading: isResultLoading,
    error: resultError
  } = useAnalysisResult(id, viewMode)

  const {
    data: analysisMeta,
    isLoading: isMetaLoading
  } = useAnalysis(id)

  const isLoading = isResultLoading || isMetaLoading

  // Derived Data
  const analysisResult = resultData?.result || {}

  console.log("analysisResult-", viewMode, analysisResult)

  // Extract biomarkers from panels if not at root
  const panels = analysisResult?.panels || []
  const biomarkers = (
    analysisResult?.biomarkers ||
    analysisResult?.key_markers ||
    panels.flatMap((p: any) => p.biomarkers || p.markers || []) ||
    []
  ).map((m: any) => {
    // Standardize status/flag
    const status = m.status || m.flag || 'Normal'

    // Parse ref_range if min/max are missing
    let ref_min = m.ref_min ?? m.ref_low
    let ref_max = m.ref_max ?? m.ref_high
    if (ref_min === undefined && ref_max === undefined && m.ref_range) {
      const parts = m.ref_range.split('-').map((s: string) => parseFloat(s.trim()))
      if (parts.length === 2) {
        ref_min = parts[0]
        ref_max = parts[1]
      }
    }

    return {
      ...m,
      status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      description: m.description || m.why_it_matters || "",
      ref_min,
      ref_max
    }
  })

  // Robust Summary Extraction
  const rawSummary = analysisResult?.summary || analysisResult?.overview?.interpretation || "No summary available."
  const summary = typeof rawSummary === 'string'
    ? rawSummary
    : (rawSummary?.headline || rawSummary?.interpretation || "Analysis complete. Review details below.")

  const takeaways = (typeof rawSummary === 'object' && rawSummary?.top_takeaways) || []

  const abnormalities = analysisResult?.key_findings ||
    analysisResult?.overview?.key_findings ||
    analysisResult?.abnormalities ||
    (analysisResult?.insights || []).map((ins: any) => ({
      title: ins.title,
      description: ins.explanation || ins.description,
      signal: ins.signal || (ins.title?.toLowerCase().includes('empfehlung') ? 'neutral' : 'attention')
    })) || []

  const confidenceNotes = analysisResult?.confidence_notes || []

  // Clear previous toasts on mount
  useEffect(() => {
    // Dismiss any loading toasts from previous steps
    toast.dismiss()
  }, [])

  // Filter biomarkers
  const filteredBiomarkers = biomarkers.filter((b: any) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const abnormalCount = biomarkers.filter((b: any) =>
    ['high', 'low', 'critical'].includes(b.status?.toLowerCase())
  ).length

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Microscope className="h-8 w-8 text-primary/50" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Generating Insights</h2>
          <p className="text-muted-foreground animate-pulse">Analyzing biomarkers for {viewMode} view...</p>
        </div>
      </div>
    )
  }

  if (resultError || !resultData) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="p-6 bg-destructive/10 rounded-full w-fit mx-auto">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Analysis Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't retrieve the results for this analysis. It might still be processing or doesn't exist.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'low': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      case 'critical': return 'text-red-700 bg-red-100 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 font-bold'
      case 'normal': return 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'
      default: return 'text-muted-foreground bg-muted border-muted'
    }
  }

  const getCardBorder = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'high': return 'border-red-500 bg-red-50/10'
      case 'low': return 'border-amber-500 bg-amber-50/10'
      case 'critical': return 'border-red-600 bg-red-50/20'
      case 'normal': return 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/50' // Cleaner look for normal
      default: return 'border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background pb-20 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
                BloodGPT Analysis
              </h1>
              <div className="text-xs text-muted-foreground flex gap-2">
                <span>{new Date(analysisMeta?.created_at || Date.now()).toLocaleDateString()}</span>
                <span>•</span>
                <span>{viewMode === 'patient' ? 'Patient View' : 'Clinical View'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-muted/50 p-1 rounded-lg flex items-center mr-2 border">
              <button
                onClick={() => setViewMode('patient')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'patient'
                  ? 'bg-white shadow-sm text-primary dark:bg-gray-800'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Patient
              </button>
              <button
                onClick={() => setViewMode('clinician')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'clinician'
                  ? 'bg-white shadow-sm text-primary dark:bg-gray-800'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Clinician
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Button size="sm" className="hidden sm:flex gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isDownloading ? 'Generating...' : 'Download Report'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Hero Summary Section */}
        <section className="bg-white dark:bg-card rounded-xl border shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Overview</h2>
              <div className="prose prose-sm md:prose-base dark:prose-invert text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
                <p>{summary}</p>
                {takeaways.length > 0 && (
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    {takeaways.map((takeaway: string, i: number) => (
                      <li key={i}>{takeaway}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Metrics Circle */}
            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 w-full md:w-auto min-w-[200px]">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    className="text-indigo-600"
                    strokeWidth="8"
                    strokeDasharray={`${((analysisResult?.scan?.in_range_percent || (biomarkers.length > 0 ? Math.round(((biomarkers.length - abnormalCount) / biomarkers.length) * 100) : 0)) * 2.83)} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analysisResult?.scan?.in_range_percent || (biomarkers.length > 0 ? Math.round(((biomarkers.length - abnormalCount) / biomarkers.length) * 100) : 0)}%
                  </span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Biomarkers in Range</div>
                <div className="text-xs text-gray-500">
                  {analysisResult?.scan?.in_range_count || (biomarkers.length - abnormalCount)} of {analysisResult?.scan?.total_biomarkers || biomarkers.length} total
                </div>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          {abnormalities.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Key Findings</h3>
              <div className="grid gap-3">
                {abnormalities.map((item: any, i: number) => {
                  const signal = item.signal || 'neutral'
                  const isAttention = signal === 'attention' || signal === 'negative'
                  return (
                    <div key={i} className={`flex gap-4 p-4 rounded-lg border-l-4 ${isAttention ? 'bg-amber-50 border-l-amber-500' : 'bg-gray-50 border-l-gray-300'} dark:bg-gray-900`}>
                      {isAttention && <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />}
                      <div>
                        <h4 className={`text-sm font-bold ${isAttention ? 'text-amber-900' : 'text-gray-900'} dark:text-gray-100 mb-1`}>
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* Panels Loop */}
        <div className="space-y-12">
          {panels.length > 0 && panels.map((panel: any, idx: number) => (
            <section key={idx} className="space-y-6">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{panel.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 max-w-2xl">{panel.panel_summary}</p>
                </div>
                {/* Small Panel metric */}
                <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-card px-4 py-2 rounded-full border shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {panel.normal_count}/{panel.total_count} Normal
                  </span>
                </div>
              </div>

              {/* Biomarkers Grid */}
              <div className="grid gap-4">
                {panel.biomarkers?.map((marker: any, mIdx: number) => {
                  const isNormal = marker.status?.toLowerCase() === 'normal'
                  const isAbnormal = !isNormal

                  // Parse ref_range if min/max are missing
                  let min = marker.ref_min ?? marker.ref_low
                  let max = marker.ref_max ?? marker.ref_high
                  if (min === undefined && max === undefined && marker.ref_range) {
                    const parts = marker.ref_range.split('-').map((s: string) => parseFloat(s.trim()))
                    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                      min = parts[0]
                      max = parts[1]
                    }
                  }

                  // Fallback to defaults if still undefined
                  min = min ?? 0
                  max = max ?? 100

                  const val = marker.value || 0
                  let pos = 50

                  // Simple linear interpolation
                  if (max > min) {
                    const range = max - min
                    // Add padding to range
                    const rangePadding = range * 0.5
                    const plotMin = Math.max(0, min - rangePadding)
                    const plotMax = max + rangePadding
                    pos = ((val - plotMin) / (plotMax - plotMin)) * 100
                  }
                  pos = Math.max(5, Math.min(95, pos)) // Clamp

                  return (
                    <div
                      key={mIdx}
                      className={`group relative bg-white dark:bg-card rounded-xl border p-5 transition-all hover:shadow-lg ${getCardBorder(marker.status)} ${isAbnormal ? 'shadow-sm' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Left: Value & Name */}
                        <div className="sm:w-1/3 space-y-3 shrink-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{marker.code || marker.name.substring(0, 3).toUpperCase()}</div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{marker.name}</h4>
                            </div>
                            <Badge className={`${getStatusColor(marker.status)} uppercase text-[10px] tracking-wider`}>
                              {marker.status}
                            </Badge>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{marker.value}</span>
                            <span className="text-lg font-medium text-gray-400">{marker.unit}</span>
                          </div>
                        </div>

                        {/* Right: Visuals & Context */}
                        <div className="flex-1 space-y-5 min-w-0">
                          {/* Range Visualization (BloodGPT Gradient Style) */}
                          <div className="space-y-1.5 pt-2">
                            <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-red-400 via-indigo-500 to-red-400 opacity-80"
                              style={{ background: `linear-gradient(to right, #ef4444 0%, #fbbf24 25%, #4ade80 40%, #4ade80 60%, #fbbf24 75%, #ef4444 100%)` }}
                            >
                              <div
                                className="absolute -top-1.5 h-6 w-1 bg-gray-900 dark:bg-white rounded shadow-lg transform -translate-x-1/2 transition-all duration-1000"
                                style={{ left: `${pos}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                              <span>{min}</span>
                              <span>Reference Range</span>
                              <span>{max}</span>
                            </div>
                          </div>

                          {/* Analysis Text */}
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              {marker.description}
                            </p>

                            {/* Trend Analysis Box */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                              <div className="text-xs font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                <Activity className="h-3 w-3 text-indigo-500" />
                                Trend Analysis
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {marker.trend_analysis || "No historical data available for trend calculation."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Confidence Notes */}
        {confidenceNotes.length > 0 && (
          <section className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-6 border border-dashed text-center space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Analysis Notes & Disclaimers</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {confidenceNotes.map((note: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={`h-1.5 w-1.5 rounded-full ${note.level === 'high' ? 'bg-indigo-500' : 'bg-gray-400'}`} />
                  {note.note}
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}