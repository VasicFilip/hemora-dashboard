'use client'

import { useRequireRole } from '@/lib/rbac'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { hasRole, isLoading } = useRequireRole('admin')

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        )
    }

    if (!hasRole) {
        return null // The useRequireRole hook will handle the redirect
    }

    return (
        <div className="container mx-auto py-6 px-4">
            {children}
        </div>
    )
}
