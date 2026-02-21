'use client'

import { useState } from 'react'
import { useAdminUsers, useAdminCreateUser, useAdminUpdateUser, useAdminDeleteUser, useResetUserPassword } from '@/lib/hooks'
import { useRequireRole } from '@/lib/rbac'
import { showToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pencil, Trash2, Key } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { UserCreate, UserResponse } from '@/types'
import { useTranslation } from '@/lib/i18n-context'

export default function UsersPage() {
    const { isLoading: roleLoading } = useRequireRole('admin')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
    const { t } = useTranslation()

    const resetPasswordMutation = useResetUserPassword()
    const { data, isLoading } = useAdminUsers({ search, page, page_size: 20 })
    const createMutation = useAdminCreateUser()
    const updateMutation = useAdminUpdateUser(selectedUser?.id || '')
    const deleteMutation = useAdminDeleteUser()

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data: UserCreate = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            name: formData.get('name') as string,
            role: formData.get('role') as 'admin' | 'clinician' | 'staff',
        }
        createMutation.mutate(data, {
            onSuccess: () => setIsCreateOpen(false),
        })
    }

    const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedUser) return
        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as 'admin' | 'clinician' | 'staff',
            is_active: formData.get('is_active') === 'true',
        }
        updateMutation.mutate(data, {
            onSuccess: () => {
                setIsEditOpen(false)
                setSelectedUser(null)
            },
        })
    }

    const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedUser) return
        const formData = new FormData(e.currentTarget)
        const new_password = formData.get('new_password') as string
        resetPasswordMutation.mutate(
            { userId: selectedUser.id, new_password },
            {
                onSuccess: () => {
                    setIsResetPasswordOpen(false)
                    setSelectedUser(null)
                }
            }
        )
    }

    const totalPages = Math.ceil((data?.total || 0) / 20)

    if (roleLoading) {
        return <div className="p-8"><div className="text-center text-muted-foreground">{t('admin_users.loading')}</div></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('admin_users.title')}</h1>
                    <p className="text-muted-foreground">{t('admin_users.description')}</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('admin_users.create_user')}
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('admin_users.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin_users.col_name')}</TableHead>
                            <TableHead>{t('admin_users.col_email')}</TableHead>
                            <TableHead>{t('admin_users.col_role')}</TableHead>
                            <TableHead>{t('admin_users.col_status')}</TableHead>
                            <TableHead>{t('admin_users.col_created')}</TableHead>
                            <TableHead className="text-right">{t('admin_users.col_actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">{t('admin_users.loading')}</TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">{t('admin_users.no_users')}</TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span className="capitalize">{user.role}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.is_active ? t('admin_users.active') : t('admin_users.inactive')}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString('de-DE')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUser(user)
                                                setIsEditOpen(true)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUser(user)
                                                setIsResetPasswordOpen(true)
                                            }}
                                        >
                                            <Key className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {t('admin_users.showing', { from: ((page - 1) * 20) + 1, to: Math.min(page * 20, data?.total || 0), total: data?.total || 0 })}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        {t('admin_users.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        {t('admin_users.next')}
                    </Button>
                </div>
            </div>

            {/* Create User Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin_users.create_title')}</DialogTitle>
                        <DialogDescription>
                            {t('admin_users.create_description')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('admin_users.name')}</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('admin_users.email')}</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">{t('admin_users.password')}</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">{t('admin_users.role')}</Label>
                                <Select name="role" defaultValue="clinician" required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="clinician">{t('admin_users.role_clinician')}</SelectItem>
                                        <SelectItem value="staff">{t('admin_users.role_staff')}</SelectItem>
                                        <SelectItem value="admin">{t('admin_users.role_admin')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                {t('admin_users.cancel')}
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? t('admin_users.creating') : t('admin_users.create_user')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin_users.edit_title')}</DialogTitle>
                        <DialogDescription>
                            {t('admin_users.edit_description')}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleEdit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">{t('admin_users.name')}</Label>
                                    <Input id="edit-name" name="name" defaultValue={selectedUser.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">{t('admin_users.email')}</Label>
                                    <Input id="edit-email" name="email" type="email" defaultValue={selectedUser.email} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-role">{t('admin_users.role')}</Label>
                                    <Select name="role" defaultValue={selectedUser.role} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="clinician">{t('admin_users.role_clinician')}</SelectItem>
                                            <SelectItem value="staff">{t('admin_users.role_staff')}</SelectItem>
                                            <SelectItem value="admin">{t('admin_users.role_admin')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">{t('admin_users.col_status')}</Label>
                                    <Select name="is_active" defaultValue={selectedUser.is_active ? 'true' : 'false'} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">{t('admin_users.active')}</SelectItem>
                                            <SelectItem value="false">{t('admin_users.inactive')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    {t('admin_users.cancel')}
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? t('admin_users.saving') : t('admin_users.save_changes')}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin_users.reset_password_title')}</DialogTitle>
                        <DialogDescription>
                            {t('admin_users.reset_password_desc', { name: selectedUser?.name || '' })}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleResetPassword}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new_password">{t('admin_users.new_password')}</Label>
                                    <Input
                                        id="new_password"
                                        name="new_password"
                                        type="password"
                                        required
                                        minLength={8}
                                        placeholder={t('admin_users.min_characters')}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
                                    {t('admin_users.cancel')}
                                </Button>
                                <Button type="submit" disabled={resetPasswordMutation.isPending}>
                                    {resetPasswordMutation.isPending ? t('admin_users.resetting') : t('admin_users.reset_password')}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
