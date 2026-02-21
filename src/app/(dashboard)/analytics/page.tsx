"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, FileText, Users, TrendingUp } from "lucide-react"
import { usePatients, useReports, useLabTests } from "@/lib/hooks"
import { TrendChart } from "@/components/charts/TrendChart"
import { DistributionChart } from "@/components/charts/DistributionChart"
import { ComparisonChart } from "@/components/charts/ComparisonChart"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "@/lib/i18n-context"

export default function AnalyticsPage() {
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ page_size: 100 })
  const { data: reportsData, isLoading: reportsLoading } = useReports({ page_size: 100 })
  const { data: labTestsData, isLoading: labTestsLoading } = useLabTests({ page_size: 100 })
  const { t } = useTranslation()

  const reports = reportsData?.data || []
  const patients = patientsData?.data || []
  const isLoading = patientsLoading || reportsLoading || labTestsLoading

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
        <p className="text-muted-foreground">
          {t('analytics.description')}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <TrendChart
              data={reports}
              title={t('analytics.analysis_volume')}
              description={t('analytics.daily_analyses')}
              dataKeys={[
                { key: "count", label: t('analytics.analyses'), color: "var(--chart-1)" }
              ]}
              height={350}
            />
          </div>
          <div className="lg:col-span-3">
            <DistributionChart
              data={reports}
              title={t('analytics.analysis_status')}
              description={t('analytics.breakdown')}
              groupByKey="status"
              labelFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
              height={350}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.comparison')}</CardTitle>
              <CardDescription>{t('analytics.system_growth')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{t('analytics.per_patient')}</p>
                  <p className="text-2xl font-bold">
                    {patients.length > 0 ? (reports.length / patients.length).toFixed(1) : '0'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{t('analytics.completion_rate')}</p>
                  <p className="text-2xl font-bold">
                    {reports.length > 0 ?
                      ((reports.filter(r => r.status === 'analyzed' || r.status === 'complete').length / reports.length) * 100).toFixed(0) + '%'
                      : '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.resource_summary')}</CardTitle>
              <CardDescription>{t('analytics.active_entities')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('analytics.active_patients')}</span>
                </div>
                <span className="font-bold">{patients.length}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('analytics.total_reports')}</span>
                </div>
                <span className="font-bold">{reports.length}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('analytics.analyses')}</span>
                </div>
                <span className="font-bold">{reports.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
