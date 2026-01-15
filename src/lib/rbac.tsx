'use client'

import { useAuth } from './auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { UserRole } from '@/types'

interface RequireRoleProps {
    roles: UserRole | UserRole[]
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
    const { hasRole, isLoading } = useAuth()

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!hasRole(roles)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

export function useRequireRole(roles: UserRole | UserRole[]) {
    const { hasRole, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        } else if (!isLoading && !hasRole(roles)) {
            router.push('/unauthorized')
        }
    }, [hasRole, isAuthenticated, isLoading, roles, router])

    return { hasRole: hasRole(roles), isLoading }
}

export function useRequireAuth() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, isLoading, router])

    return { isAuthenticated, isLoading }
}
