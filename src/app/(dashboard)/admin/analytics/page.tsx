"use client"

import * as React from "react"
import { useAnalyticsStats, useAnalyticsActivity } from "@/lib/hooks"
import { useRequireRole } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendChart } from "@/components/charts/TrendChart"
import { DistributionChart } from "@/components/charts/DistributionChart"
import { ComparisonChart } from "@/components/charts/ComparisonChart"
import { Users, Activity, FileText, Shield } from "lucide-react"

export default function AdminAnalyticsPage() {
    const { isLoading: roleLoading } = useRequireRole('admin')
    const { data: stats } = useAnalyticsStats()
    const { data: activity } = useAnalyticsActivity(30)

    // Calculate analyses per user safely
    const analysesPerUser = (stats?.total_users && stats.total_analyses)
        ? (stats.total_analyses / stats.total_users).toFixed(1)
        : '0.0'

    // Mock role distribution data (TODO: replace with actual API data when available)
    const roleDistribution = [
        { id: 'admin', label: 'Admin', value: 2 },
        { id: 'clinician', label: 'Clinician', value: 15 },
        { id: 'staff', label: 'Staff', value: 8 },
    ]

    if (roleLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="flex flex-col space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
                    <p className="text-muted-foreground">
                        Global overview of Hemora platform performance and usage
                    </p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Administrator View</span>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <div className="lg:col-span-4">
                        <TrendChart
                            data={(activity || []).map(item => ({ ...item, created_at: item.date }))}
                            title="Platform Activity"
                            description="Historical analysis volume across all clinicians"
                            dataKeys={[
                                { key: "value", label: "Analyses", color: "var(--chart-2)" }
                            ]}
                            height={350}
                            transformData={(data) => {
                                return data.map(item => ({ ...item, date: item.date }))
                            }}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <DistributionChart
                            data={roleDistribution || []}
                            title="User Roles"
                            description="Distribution of administrative and clinical staff"
                            groupByKey="id"
                            labelFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                            height={350}
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Analyses per User</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground/50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analysesPerUser}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground/50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.change_percentages?.analyses ? (
                                    <span className={stats.change_percentages.analyses > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {stats.change_percentages.analyses > 0 ? '+' : ''}{stats.change_percentages.analyses}%
                                    </span>
                                ) : '0%'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">vs. previous month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground/50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.total_reports && stats.total_analyses
                                    ? Math.round((stats.total_reports / stats.total_analyses) * 100)
                                    : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Report generation rate</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Load Comparison</CardTitle>
                        <CardDescription>Comparative analysis of platform resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for future multi-metric chart */}
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg">
                            <p>Detailed system load scaling metrics coming soon</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
