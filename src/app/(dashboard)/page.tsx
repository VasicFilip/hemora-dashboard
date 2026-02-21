"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useReports, useUser, useAnalyticsStats, useAnalyticsActivity, useAnalyticsRiskProfile } from "@/lib/hooks"
import { TrendChart } from "@/components/charts/TrendChart"
import { DistributionChart } from "@/components/charts/DistributionChart"
import { useTranslation } from "@/lib/i18n-context"
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data: user } = useUser()
  const { data: stats, isLoading: statsLoading } = useAnalyticsStats()
  const { data: activityData, isLoading: activityLoading } = useAnalyticsActivity(30)
  const { data: riskProfile, isLoading: riskLoading } = useAnalyticsRiskProfile()
  const { data: reportsData, isLoading: reportsLoading } = useReports({ page_size: 10 })
  const { t } = useTranslation()

  const reports = reportsData?.data || []
  const isLoading = statsLoading || activityLoading || reportsLoading || riskLoading

  return (
    <div className="flex flex-col space-y-8 p-4 sm:p-6 lg:p-8 container mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.welcome', { name: user?.name || 'Dr. Clinician' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex" asChild>
            <Link href="/patients">{t('dashboard.view_patients')}</Link>
          </Button>
          <Button className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95" asChild>
            <Link href="/upload">
              <Activity className="mr-2 h-4 w-4" />
              {t('dashboard.new_analysis')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} variant="glass" className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card variant="glass" className="group border-l-4 border-l-blue-500 transition-all hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.total_patients')}</CardTitle>
                <div className="rounded-full bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stats?.total_patients || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {t('dashboard.active_in_org')}
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" className="group border-l-4 border-l-emerald-500 transition-all hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.new_analyses')}</CardTitle>
                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stats?.analyses_this_month || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {t('dashboard.processed_this_month')}
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" className="group border-l-4 border-l-amber-500 transition-all hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.pending_review')}</CardTitle>
                <div className="rounded-full bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stats?.pending_analyses || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {t('dashboard.awaiting_attention')}
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" className="group border-l-4 border-l-rose-500 transition-all hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.system_health')}</CardTitle>
                <div className="rounded-full bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{t('dashboard.active')}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {t('dashboard.engine_normal')}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card variant="glass" className="lg:col-span-4 p-0 overflow-hidden">
          <TrendChart
            data={activityData || []}
            title={t('dashboard.extraction_activity')}
            description={t('dashboard.daily_throughput')}
            dataKeys={[
              { key: "value", label: t('dashboard.total_analysis'), color: "hsl(var(--primary))" }
            ]}
            height={350}
            transformData={(data: any) => data.map((d: any) => ({ date: d.date, value: d.value }))}
          />
        </Card>

        <Card variant="glass" className="lg:col-span-3 p-0">
          <DistributionChart
            data={riskProfile || []}
            title={t('dashboard.health_distribution')}
            description={t('dashboard.clinical_findings')}
            groupByKey="label"
            labelFormatter={(v: string) => v}
            height={350}
          />
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('dashboard.recent_reports')}</CardTitle>
              <CardDescription>{t('dashboard.latest_interpretations')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
              <Link href="/reports">{t('dashboard.view_all')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="bg-secondary/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 opacity-20" />
                </div>
                <p className="text-sm font-medium">{t('dashboard.no_reports')}</p>
                <p className="text-xs mt-1">{t('dashboard.submit_blood_test')}</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reports.slice(0, 4).map((report) => {
                  const patientName = report.patient
                    ? `${report.patient.firstName} ${report.patient.lastName}`
                    : t('dashboard.external_patient')
                  const testType = report.source || t('dashboard.biochemical_panel')
                  const status = report.status?.toLowerCase() || 'normal'

                  let badgeStyles = "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  let badgeText = t('dashboard.normal')

                  if (status.includes('abnormal') || status.includes('critical')) {
                    badgeStyles = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    badgeText = t('dashboard.action_reqd')
                  } else if (status.includes('borderline') || status.includes('review')) {
                    badgeStyles = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    badgeText = t('dashboard.review')
                  }

                  return (
                    <div key={report.id} className="flex items-center space-x-4 group cursor-pointer transition-colors hover:bg-white/5 p-2 rounded-lg -mx-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate leading-none mb-1.5">{patientName}</p>
                        <p className="text-xs text-muted-foreground truncate uppercase tracking-tighter">{testType}</p>
                      </div>
                      <Badge variant="outline" className={`font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${badgeStyles}`}>
                        {badgeText}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
            <Button variant="secondary" className="w-full mt-2 font-semibold" asChild>
              <Link href="/patients">
                {t('dashboard.access_all')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions Column */}
        <div className="space-y-6">
          <Card variant="glass" className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.quick_workflows')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button className="justify-start h-auto py-3 bg-white/10 hover:bg-white/20 text-foreground border-none shadow-sm" variant="outline" asChild>
                <Link href="/patients/new">
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="flex items-center gap-2 font-bold"><Users className="h-4 w-4 text-blue-500" /> {t('dashboard.new_patient')}</span>
                    <span className="text-[10px] text-muted-foreground">{t('dashboard.register')}</span>
                  </div>
                </Link>
              </Button>
              <Button className="justify-start h-auto py-3 bg-white/10 hover:bg-white/20 text-foreground border-none shadow-sm" variant="outline" asChild>
                <Link href="/upload">
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="flex items-center gap-2 font-bold"><Activity className="h-4 w-4 text-emerald-500" /> {t('dashboard.fast_scan')}</span>
                    <span className="text-[10px] text-muted-foreground">{t('dashboard.pdf_extraction')}</span>
                  </div>
                </Link>
              </Button>
              <Button className="justify-start h-auto py-3 bg-white/10 hover:bg-white/20 text-foreground border-none shadow-sm" variant="outline" asChild>
                <Link href="/analytics">
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="flex items-center gap-2 font-bold"><TrendingUp className="h-4 w-4 text-indigo-500" /> {t('dashboard.analytics')}</span>
                    <span className="text-[10px] text-muted-foreground">{t('dashboard.detailed_insights')}</span>
                  </div>
                </Link>
              </Button>
              <Button className="justify-start h-auto py-3 bg-white/10 hover:bg-white/20 text-foreground border-none shadow-sm" variant="outline" asChild>
                <Link href="/settings">
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="flex items-center gap-2 font-bold"><FileText className="h-4 w-4 text-rose-500" /> {t('dashboard.management')}</span>
                    <span className="text-[10px] text-muted-foreground">{t('dashboard.org_settings')}</span>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-secondary/20 shadow-inner">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t('dashboard.action_reminder')}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('dashboard.pending_signoff', { count: stats?.pending_analyses || 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
