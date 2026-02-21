'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

export default function UnauthorizedPage() {
    const router = useRouter()
    const { t } = useTranslation()

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">{t('unauthorized.title')}</CardTitle>
                    <CardDescription>
                        {t('unauthorized.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        {t('unauthorized.details')}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.back()}
                        >
                            {t('unauthorized.go_back')}
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => router.push('/')}
                        >
                            {t('unauthorized.go_dashboard')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
