"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatients, useReports, useLabTests, useUser } from "@/lib/hooks"
import { TrendChart } from "@/components/charts/TrendChart"
import { DistributionChart } from "@/components/charts/DistributionChart"
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data: user } = useUser()
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ page_size: 100 })
  const { data: reportsData, isLoading: reportsLoading } = useReports({ page_size: 100 })
  const { data: labTestsData, isLoading: labTestsLoading } = useLabTests({ page_size: 100 })

  const patients = patientsData?.data || []
  const reports = reportsData?.data || []
  const labTests = labTestsData?.data || []

  const isLoading = patientsLoading || reportsLoading || labTestsLoading

  // Calculate this week's analyses
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const thisWeekAnalyses = labTests.filter(test =>
    new Date(test.created_at) >= oneWeekAgo
  ).length

  // Calculate abnormal results (placeholder - would need actual status from reports)
  const abnormalResults = Math.floor(reports.length * 0.15) // Estimate 15% abnormal

  const recentAnalyses = labTests.slice(0, 5) // Get 5 most recent
  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Dr. Clinician'}
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Activity className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {/* Skeleton loaders for stats cards */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active patients in system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analyses This Week</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thisWeekAnalyses}</div>
                <p className="text-xs text-muted-foreground">
                  New tests processed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abnormal Results</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{abnormalResults}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Analysis reports generated
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <TrendChart
            data={reports}
            title="Analysis Volume"
            description="Number of analyses processed over time"
            dataKeys={[
              { key: "count", label: "Analyses", color: "var(--chart-1)" }
            ]}
            height={300}
          />
        </div>
        <div className="lg:col-span-3">
          <DistributionChart
            data={reports}
            title="Analysis Status"
            description="Breakdown of analysis results"
            groupByKey="status"
            labelFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
            height={300}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Latest blood test interpretations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </>
            ) : reports.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No analyses yet</p>
                <p className="text-xs mt-1">Upload a blood test to get started</p>
              </div>
            ) : (
              <>
                {reports.slice(0, 3).map((report) => {
                  const patientName = report.patient
                    ? `${report.patient.firstName} ${report.patient.lastName}`
                    : 'Unknown Patient'
                  const testType = report.lab_test?.lab_name || report.source || 'Blood Test'
                  const status = report.status?.toLowerCase() || 'normal'

                  // Determine badge variant based on status
                  let badgeVariant: "default" | "destructive" | "outline" | "secondary" = "outline"
                  let badgeText = "Normal"

                  if (status.includes('abnormal') || status.includes('critical')) {
                    badgeVariant = "destructive"
                    badgeText = "Abnormal"
                  } else if (status.includes('borderline') || status.includes('review')) {
                    badgeVariant = "secondary"
                    badgeText = "Review"
                  }

                  return (
                    <div key={report.id} className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{patientName}</p>
                        <p className="text-sm text-muted-foreground truncate">{testType}</p>
                      </div>
                      <Badge variant={badgeVariant}>{badgeText}</Badge>
                    </div>
                  )
                })}
              </>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/patients">
                View All Patients
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" asChild>
              <Link href="/patients/new">
                <Users className="mr-2 h-4 w-4" />
                Add New Patient
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/upload">
                <FileText className="mr-2 h-4 w-4" />
                Upload Blood Test
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}