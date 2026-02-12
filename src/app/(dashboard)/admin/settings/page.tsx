'use client'

import { useAdminSettings, useAdminUpdateSettings } from '@/lib/hooks'
import { useRequireRole } from '@/lib/rbac'
import { showToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save } from 'lucide-react'
import type { SettingsUpdate } from '@/types'

export default function SettingsPage() {
    const { isLoading: roleLoading } = useRequireRole('admin')
    const { data: settings, isLoading } = useAdminSettings()
    const updateMutation = useAdminUpdateSettings()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data: SettingsUpdate = {
            name: formData.get('name') as string,
            settings: {
                // Add any custom settings here
            },
        }
        updateMutation.mutate(data)
    }

    if (roleLoading || isLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Organization Settings</h1>
                <p className="text-muted-foreground">Manage your organization configuration</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                            Basic organization information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={settings?.name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="id">Organization ID</Label>
                            <Input
                                id="id"
                                value={settings?.id}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-sm text-muted-foreground">
                                This is your unique organization identifier
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>
                            Current system configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">API Version</Label>
                                <p className="text-sm font-medium">1.0.0</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Environment</Label>
                                <p className="text-sm font-medium">Production</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Database</Label>
                                <p className="text-sm font-medium">PostgreSQL</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Storage</Label>
                                <p className="text-sm font-medium">Supabase</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={updateMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
