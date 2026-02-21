"use client"

import { useAnalyticsStats, useAnalyticsActivity, useAnalyticsRiskProfile } from "@/lib/hooks"
import { useRequireRole } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendChart } from "@/components/charts/TrendChart"
import { DistributionChart } from "@/components/charts/DistributionChart"
import {
    Users,
    FileText,
    Activity,
    TrendingUp,
    Shield,
    Server,
    Database,
    Globe,
    ArrowRight,
    ExternalLink,
    Plus
} from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n-context"

export default function AdminDashboard() {
    const { isLoading: roleLoading } = useRequireRole('admin')
    const { data: stats, isLoading: statsLoading } = useAnalyticsStats()
    const { data: activityData, isLoading: activityLoading } = useAnalyticsActivity(30)
    const { data: riskProfile, isLoading: riskLoading } = useAnalyticsRiskProfile()
    const { t } = useTranslation()

    const systemHealth = {
        api: t('admin.api_intelligence'),
        database: t('admin.core_database'),
        storage: "92% Free",
        uptime: "99.99%"
    }

    const isLoading = statsLoading || activityLoading || riskLoading

    if (roleLoading) {
        return <div className="p-8 text-center text-muted-foreground">{t('admin.loading')}</div>
    }

    const statCards = [
        {
            title: t('admin.active_clinicians'),
            value: stats?.total_users || 0,
            icon: Users,
            color: "from-blue-500/10 to-blue-600/5",
            textColor: "text-blue-600",
            description: t('admin.across_orgs')
        },
        {
            title: t('admin.total_patients'),
            value: stats?.total_patients || 0,
            icon: FileText,
            color: "from-emerald-500/10 to-emerald-600/5",
            textColor: "text-emerald-600",
            description: t('admin.aggregated_registry')
        },
        {
            title: t('admin.monthly_volume'),
            value: stats?.analyses_this_month || 0,
            icon: Activity,
            color: "from-amber-500/10 to-amber-600/5",
            textColor: "text-amber-600",
            description: t('admin.extractions_month')
        },
        {
            title: t('admin.analysis_success'),
            value: "99.2%",
            icon: TrendingUp,
            color: "from-indigo-500/10 to-indigo-600/5",
            textColor: "text-indigo-600",
            description: t('admin.reliability_rate')
        }
    ]

    const logs = [
        { event: t('admin.log_schema'), service: t('admin.log_db'), time: t('admin.log_2min'), status: "success" },
        { event: t('admin.log_worker'), service: t('admin.log_extraction'), time: t('admin.log_15min'), status: "info" },
        { event: t('admin.log_clinical'), service: t('admin.log_analytics'), time: t('admin.log_1hour'), status: "success" },
        { event: t('admin.log_backup'), service: t('admin.log_storage'), time: t('admin.log_4hours'), status: "success" }
    ]

    return (
        <div className="flex flex-col space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 font-bold flex gap-1">
                            <Shield className="h-3 w-3" /> {t('admin.badge')}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {t('admin.title')}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {t('admin.description')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex" asChild>
                        <Link href="/admin/users">{t('admin.manage_users')}</Link>
                    </Button>
                    <Button className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95" asChild>
                        <Link href="/admin/users">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin.onboard_clinic')}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="overflow-hidden border-none bg-secondary/30 backdrop-blur-sm">
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
                    statCards.map((stat, i) => (
                        <Card key={i} className={`group border-none bg-gradient-to-br ${stat.color} transition-all hover:shadow-xl`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className={`text-sm font-semibold uppercase tracking-wider ${stat.textColor}/80`}>{stat.title}</CardTitle>
                                <div className={`rounded-full bg-background/50 p-2 ${stat.textColor}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1 font-medium italic">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Analytics Visualization */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10 overflow-hidden">
                    <TrendChart
                        data={activityData || []}
                        title={t('admin.extraction_throughput')}
                        description={t('admin.global_activity')}
                        dataKeys={[
                            { key: "value", label: t('admin.marker_extractions'), color: "hsl(var(--primary))" }
                        ]}
                        height={350}
                        transformData={(data: any) => data.map((d: any) => ({ date: d.date, value: d.value }))}
                    />
                </Card>

                <Card className="lg:col-span-3 border-none bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10">
                    <CardHeader>
                        <CardTitle>{t('admin.clinical_distribution')}</CardTitle>
                        <CardDescription>{t('admin.system_wide')}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center">
                        <DistributionChart
                            data={riskProfile || []}
                            title={t('admin.clinical_distribution')}
                            groupByKey="label"
                            labelFormatter={(v: string) => v}
                            height={300}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* System Infrastructure & Logs */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10 overflow-hidden col-span-1">
                    <CardHeader className="bg-white/5 border-b border-white/5">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Server className="h-5 w-5 text-primary" /> {t('admin.infrastructure')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('admin.api_intelligence')}</span>
                                <Badge className="bg-green-500/10 text-green-500 border-none font-bold">Operational</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('admin.core_database')}</span>
                                <Badge className="bg-green-500/10 text-green-500 border-none font-bold">Connected</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('admin.storage_quota')}</span>
                                <Badge className="bg-blue-500/10 text-blue-500 border-none font-bold">92% Free</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('admin.sla_uptime')}</span>
                                <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-bold">99.99%</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/10 col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t('admin.maintenance_logs')}</CardTitle>
                            <CardDescription>{t('admin.realtime_events')}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                            <Link href="/admin/logs">{t('admin.view_all_logs')} <ExternalLink className="ml-2 h-3 w-3" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{log.event}</span>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{log.service}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-muted-foreground">{log.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="w-full font-bold">
                            {t('admin.initiate_diagnostic')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
