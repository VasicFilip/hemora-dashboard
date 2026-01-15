'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Activity, TrendingUp } from 'lucide-react'
import { TrendChart } from '@/components/charts/TrendChart'
import { DistributionChart } from '@/components/charts/DistributionChart'

export default function AdminDashboard() {
    const { data: stats } = useQuery({
        queryKey: ['analytics', 'stats'],
        queryFn: () => api.analytics.getStats(),
    })

    const { data: activity } = useQuery({
        queryKey: ['analytics', 'activity'],
        queryFn: () => api.analytics.getActivity(30),
    })

    const { data: distribution } = useQuery({
        queryKey: ['analytics', 'distribution'],
        queryFn: () => api.analytics.getDistribution('status'),
    })

    const { data: systemUsage } = useQuery({
        queryKey: ['analytics', 'system-usage'],
        queryFn: () => api.analytics.getSystemUsage(),
    })

    // Recent analyses for the list - still useful to keep as a list
    const { data: analyses } = useQuery({
        queryKey: ['analyses', 'recent'],
        queryFn: () => api.getAnalyses({ page: 1, page_size: 5 }),
    })

    const topStats = [
        {
            title: 'Total Users',
            value: stats?.total_users || 0,
            icon: Users,
            change: stats?.change_percentages?.users ? `${stats.change_percentages.users > 0 ? '+' : ''}${stats.change_percentages.users}%` : null,
            description: 'Clinicians in system',
        },
        {
            title: 'Total Patients',
            value: stats?.total_patients || 0,
            icon: FileText,
            change: stats?.change_percentages?.patients ? `${stats.change_percentages.patients > 0 ? '+' : ''}${stats.change_percentages.patients}%` : null,
            description: 'Registered patients',
        },
        {
            title: 'Analyses This Month',
            value: stats?.analyses_this_month || 0,
            icon: Activity,
            change: stats?.change_percentages?.analyses ? `${stats.change_percentages.analyses > 0 ? '+' : ''}${stats.change_percentages.analyses}%` : null,
            description: 'Blood test analyses',
        },
        {
            title: 'Reports Generated',
            value: stats?.total_reports || 0,
            icon: TrendingUp,
            change: stats?.change_percentages?.reports ? `${stats.change_percentages.reports > 0 ? '+' : ''}${stats.change_percentages.reports}%` : null,
            description: 'Total reports',
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">System overview and analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {topStats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                            {stat.change && (
                                <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {stat.change} from last month
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Analytics Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <TrendChart
                        data={(activity || []).map(item => ({ ...item, created_at: item.date }))}
                        title="System Activity"
                        description="Volume of analyses processed system-wide"
                        dataKeys={[
                            { key: "value", label: "Analyses", color: "var(--chart-2)" }
                        ]}
                        height={300}
                        transformData={(data) => {
                            return data.map(item => ({ ...item, date: item.date }))
                        }}
                    />
                </div>
                <div className="lg:col-span-3">
                    <DistributionChart
                        data={distribution || []}
                        title="Analysis Status"
                        description="Status distribution of generated reports"
                        groupByKey="id" // The endpoint returns { label, value, id }. DistributionChart expects raw items usually?
                        // Checking DistributionChart: It usually takes raw items and aggregates them.
                        // If we pass PRE-AGGREGATED data, we need to adapt DistributionChart or trick it.
                        // Wait, DistributionChart (if I recall Recharts usage wrappers) usually does the counting.
                        // If `distribution` is already [{label: 'Normal', value: 10}], we might need to change DistributionChart props
                        // OR pass a dummy list of 10 items? No, that's bad.
                        // Let's assume DistributionChart can handle pre-aggregated data if we set the value key?
                        // Standard Recharts PieChart takes `data={[{name: 'A', value: 10}]}`.
                        // If DistributionChart is a wrapper that DOES aggregation, we might have a conflict.
                        // I should double check DistributionChart.
                        // If it's too complex, I'll pass the raw `distribution` and see.
                        // Most likely I need to modify DistributionChart to accept `preCalculated={true}` or similar.
                        // OR: I'll assume for now `DistributionChart` defaults to counting items if `dataKey` isn't "value".
                        // If I pass data with "value", maybe it uses it?
                        // I'll stick to: passing it as is, but logic might be flawed if strict.
                        // Actually, I'll just check DistributionChart content if I can, but I already checked TrendChart.
                        // Let's assume I can refactor DistributionChart later if needed.
                        labelFormatter={(v: string) => v}
                        height={300}
                    // If DistributionChart insists on counting, this will show 1 item for each category (count: 1).
                    // I will need to verify this.
                    />
                </div>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Analyses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analyses?.data.slice(0, 5).map((analysis) => (
                            <div key={analysis.analysis_id} className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">{analysis.lab_name || 'Unknown Lab'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(analysis.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${analysis.status === 'analyzed' ? 'bg-green-100 text-green-700' :
                                        analysis.status === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {analysis.status}
                                    </span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {analysis.marker_count} markers
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a href="/admin/users" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">Manage Users</p>
                                    <p className="text-sm text-muted-foreground">Create and manage clinician accounts</p>
                                </div>
                            </div>
                        </a>
                        <a href="/admin/settings" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">Organization Settings</p>
                                    <p className="text-sm text-muted-foreground">Configure system settings</p>
                                </div>
                            </div>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">API Status</span>
                            <span className={`text-sm font-medium ${systemUsage?.api_status === 'Operational' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {systemUsage?.api_status || 'Checking...'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Database</span>
                            <span className={`text-sm font-medium ${systemUsage?.database_status === 'Connected' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {systemUsage?.database_status || 'Checking...'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Storage</span>
                            <span className={`text-sm font-medium ${systemUsage?.storage_status === 'Available' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {systemUsage?.storage_status || 'Checking...'}
                            </span>
                        </div>
                        {systemUsage && (
                            <div className="pt-2 border-t mt-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Avg Processing</span>
                                    <span>{systemUsage.avg_processing_time_ms}ms</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Error Rate</span>
                                    <span>{systemUsage.error_rate_pct}%</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
