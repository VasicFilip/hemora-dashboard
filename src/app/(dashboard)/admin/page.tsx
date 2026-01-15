'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Activity, TrendingUp } from 'lucide-react'
import { TrendChart } from '@/components/charts/TrendChart'
import { DistributionChart } from '@/components/charts/DistributionChart'

export default function AdminDashboard() {
    const { data: users } = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: () => api.getUsers({ page: 1, page_size: 100 }),
    })

    const { data: patients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => api.getPatients({ page: 1, page_size: 100 }),
    })

    const { data: analyses } = useQuery({
        queryKey: ['analyses'],
        queryFn: () => api.getAnalyses({ page: 1, page_size: 100 }),
    })

    const { data: reports } = useQuery({
        queryKey: ['reports'],
        queryFn: () => api.getReports({ page: 1, page_size: 100 }),
    })

    // Calculate this month's analyses
    const analysesThisMonth = analyses?.data.filter(a => {
        const date = new Date(a.created_at)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length || 0

    const stats = [
        {
            title: 'Total Users',
            value: users?.total || 0,
            icon: Users,
            change: '+12%',
            description: 'Clinicians in system',
        },
        {
            title: 'Total Patients',
            value: patients?.total || 0,
            icon: FileText,
            change: '+23%',
            description: 'Registered patients',
        },
        {
            title: 'Analyses This Month',
            value: analysesThisMonth,
            icon: Activity,
            change: '+18%',
            description: 'Blood test analyses',
        },
        {
            title: 'Reports Generated',
            value: reports?.total || 0,
            icon: TrendingUp,
            change: '+15%',
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
                {stats.map((stat) => (
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
                            <p className="text-xs text-green-600 mt-1">
                                {stat.change} from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Analytics Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <TrendChart
                        data={analyses?.data || []}
                        title="System Activity"
                        description="Volume of analyses processed system-wide"
                        dataKeys={[
                            { key: "count", label: "Analyses", color: "var(--chart-2)" }
                        ]}
                        height={300}
                    />
                </div>
                <div className="lg:col-span-3">
                    <DistributionChart
                        data={reports?.data || []}
                        title="Analysis Status"
                        description="Status distribution of generated reports"
                        groupByKey="status"
                        labelFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                        height={300}
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
                            <span className="text-sm text-green-600 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Database</span>
                            <span className="text-sm text-green-600 font-medium">Connected</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Storage</span>
                            <span className="text-sm text-green-600 font-medium">Available</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
