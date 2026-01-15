'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                    <CardDescription>
                        You don't have permission to access this page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        This page requires admin privileges. Please contact your administrator if you believe this is an error.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.back()}
                        >
                            Go Back
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => router.push('/')}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
