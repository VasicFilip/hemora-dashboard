'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const from = searchParams.get('from') || '/'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await login(email, password)
            // Redirect to the page they were trying to access, or home
            router.push(from)
        } catch (error: any) {
            toast.error('Login failed', {
                description: error.message || 'Invalid email or password',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <Activity className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold">hemora.ch</CardTitle>
                    <CardDescription>
                        Clinical Blood Analysis Assistant
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="clinician@hemora.ch"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <p>Sign in with your clinician account</p>
                        <p className="mt-2">Contact your administrator for access</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
