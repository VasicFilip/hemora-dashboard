"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendChart } from "@/components/charts/TrendChart"
import { DistributionChart } from "@/components/charts/DistributionChart"
import { ComparisonChart } from "@/components/charts/ComparisonChart"
import { Users, Activity, FileText, Shield } from "lucide-react"

export default function AdminAnalyticsPage() {
    const { data: usersData } = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: () => api.getUsers({ page: 1, page_size: 100 }),
    })

    const { data: analysesData } = useQuery({
        queryKey: ['analyses'],
        queryFn: () => api.getAnalyses({ page: 1, page_size: 100 }),
    })

    const { data: reportsData } = useQuery({
        queryKey: ['reports'],
        queryFn: () => api.getReports({ page: 1, page_size: 100 }),
    })

    const { data: patientsData } = useQuery({
        queryKey: ['patients'],
        queryFn: () => api.getPatients({ page: 1, page_size: 100 }),
    })

    const analyses = analysesData?.data || []
    const users = usersData?.data || []
    const patients = patientsData?.data || []
    const reports = reportsData?.data || []

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
                            data={analyses}
                            title="Platform Activity"
                            description="Historical analysis volume across all clinicians"
                            dataKeys={[
                                { key: "count", label: "Analyses", color: "var(--chart-2)" }
                            ]}
                            height={350}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <DistributionChart
                            data={users}
                            title="User Roles"
                            description="Distribution of administrative and clinical staff"
                            groupByKey="role"
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
                                {users.length > 0 ? (analyses.length / users.length).toFixed(1) : '0'}
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
                                +18.4%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">vs. previous 30 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground/50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                92%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Extraction success rate</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Load Comparison</CardTitle>
                        <CardDescription>Comparative analysis of platform resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                            <ComparisonChart
                                data={[
                                    { date: '2024-01', users: 10, patients: 50, reports: 120 },
                                    { date: '2024-02', users: 15, patients: 80, reports: 190 },
                                    { date: '2024-03', users: 22, patients: 120, reports: 280 }
                                ]}
                                title=""
                                dataKeys={[
                                    { key: "users", label: "Clinicians", color: "var(--chart-1)" },
                                    { key: "patients", label: "Patients", color: "var(--chart-3)" },
                                    { key: "reports", label: "Reports", color: "var(--chart-5)" }
                                ]}
                                allowToggle
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
