'use client'

import { useState } from 'react'
import { useAdminAuditLogs } from '@/lib/hooks'
import { useRequireRole } from '@/lib/rbac'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { Search, Loader2 } from 'lucide-react'

export default function AuditLogsPage() {
    const { isLoading: roleLoading } = useRequireRole('admin')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [userIdFilter, setUserIdFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('')

    // Debounce search/filter logic could be added here for better UX
    // For now, we'll pass values directly or use a "Apply" button approach
    // But to keep it reactive as per typical dashboard patterns:

    const { data, isLoading, isError } = useAdminAuditLogs({
        page,
        page_size: pageSize,
        user_id: userIdFilter || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
    })

    const totalPages = data ? Math.ceil(data.total / pageSize) : 0

    if (roleLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">
                    View system activity and security checks.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Logs</CardTitle>
                    <CardDescription>
                        Search logs by user ID or action type.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter by User UUID..."
                                value={userIdFilter}
                                onChange={(e) => {
                                    setUserIdFilter(e.target.value)
                                    setPage(1) // Reset to page 1 on filter change
                                }}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select
                                value={actionFilter}
                                onValueChange={(val) => {
                                    setActionFilter(val)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="login">Login</SelectItem>
                                    <SelectItem value="logout">Logout</SelectItem>
                                    <SelectItem value="admin_reset_password">Admin PW Reset</SelectItem>
                                    <SelectItem value="change_password">User PW Change</SelectItem>
                                    <SelectItem value="create_user">Create User</SelectItem>
                                    {/* Add more known actions as they become relevant */}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading logs...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-red-500">
                                    Failed to load audit logs.
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No logs found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">
                                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {log.user_id}
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground" title={JSON.stringify(log.details, null, 2)}>
                                        {JSON.stringify(log.details)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages || 1}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
