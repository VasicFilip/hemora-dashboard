'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/lib/auth-context'
import { HemoraLogo } from '@/components/HemoraLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { useTranslation } from '@/lib/i18n-context'

const loginSchema = z.object({
    email: z.string().email('Invalid email address').trim(),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const from = searchParams.get('from') || '/'
    const { t } = useTranslation()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true)

        try {
            await login(data.email, data.password)
            router.push(from)
        } catch (error: any) {
            showToast.error(t('login.failed'), error.message || 'Invalid email or password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex h-16 items-center justify-center px-6">
                        <HemoraLogo size="xl" showText={true} />
                    </div>
                    <CardDescription>
                        {t('login.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('login.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="clinician@hemora.ch"
                                {...form.register('email')}
                                disabled={isLoading}
                                autoComplete="email"
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{t('login.invalid_email')}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('login.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...form.register('password')}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">{t('login.password_required')}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('login.signing_in')}
                                </>
                            ) : (
                                t('login.sign_in')
                            )}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <p>{t('login.with_account')}</p>
                        <p className="mt-2">{t('login.contact_admin')}</p>
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
