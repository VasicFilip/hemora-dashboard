'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api, setAuthToken, setRefreshToken, removeAuthToken, removeRefreshToken, getAuthToken } from './api'
import type { AuthUser, AuthState, UserRole } from '@/types'

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
    hasRole: (roles: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    })
    const router = useRouter()

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const token = getAuthToken()
            if (!token) {
                setState({ user: null, isAuthenticated: false, isLoading: false })
                return
            }

            try {
                const user = await api.getMe()
                setState({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role as UserRole,
                        organization_id: user.organization_id,
                        is_active: user.is_active,
                    },
                    isAuthenticated: true,
                    isLoading: false,
                })
            } catch (error) {
                // Token invalid, clear it
                removeAuthToken()
                removeRefreshToken()
                setState({ user: null, isAuthenticated: false, isLoading: false })
            }
        }

        loadUser()
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await api.login({ email, password })
            setAuthToken(response.access_token)
            setRefreshToken(response.refresh_token)

            const user = await api.getMe()
            setState({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as UserRole,
                    organization_id: user.organization_id,
                    is_active: user.is_active,
                },
                isAuthenticated: true,
                isLoading: false,
            })

            router.push('/')
        } catch (error) {
            throw error
        }
    }, [router])

    const logout = useCallback(async () => {
        try {
            await api.logout()
        } catch (error) {
            // Ignore logout errors
        } finally {
            removeAuthToken()
            removeRefreshToken()
            setState({ user: null, isAuthenticated: false, isLoading: false })
            router.push('/login')
        }
    }, [router])

    const refreshUser = useCallback(async () => {
        try {
            const user = await api.getMe()
            setState(prev => ({
                ...prev,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as UserRole,
                    organization_id: user.organization_id,
                    is_active: user.is_active,
                },
            }))
        } catch (error) {
            console.error('Failed to refresh user:', error)
        }
    }, [])

    const hasRole = useCallback((roles: UserRole | UserRole[]) => {
        if (!state.user) return false
        const roleArray = Array.isArray(roles) ? roles : [roles]
        return roleArray.includes(state.user.role)
    }, [state.user])

    return (
        <AuthContext.Provider value={{ ...state, login, logout, refreshUser, hasRole }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
