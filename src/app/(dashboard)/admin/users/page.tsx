'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
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
import { toast } from 'sonner'
import type { UserCreate, UserResponse } from '@/types'

export default function UsersPage() {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'users', { search, page }],
        queryFn: () => api.getUsers({ search, page, page_size: 20 }),
    })

    const createMutation = useMutation({
        mutationFn: api.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
            setIsCreateOpen(false)
            toast.success('User created successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create user')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
            setIsEditOpen(false)
            setSelectedUser(null)
            toast.success('User updated successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update user')
        },
    })

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data: UserCreate = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            name: formData.get('name') as string,
            role: formData.get('role') as 'admin' | 'clinician' | 'staff',
        }
        createMutation.mutate(data)
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
        updateMutation.mutate({ id: selectedUser.id, data })
    }

    const totalPages = Math.ceil((data?.total || 0) / 20)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage clinician accounts</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create User
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No users found</TableCell>
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
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data?.total || 0)} of {data?.total || 0} users
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Create User Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Add a new clinician to the system. They can log in immediately after creation.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" defaultValue="clinician" required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="clinician">Clinician</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleEdit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" name="name" defaultValue={selectedUser.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input id="edit-email" name="email" type="email" defaultValue={selectedUser.email} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select name="role" defaultValue={selectedUser.role} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="clinician">Clinician</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select name="is_active" defaultValue={selectedUser.is_active ? 'true' : 'false'} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
