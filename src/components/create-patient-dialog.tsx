"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useCreatePatient } from "@/lib/hooks"
import { toast } from "sonner"

const patientSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters").trim(),
    lastName: z.string().min(2, "Last name must be at least 2 characters").trim(),
    email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
    phone: z.string().regex(/^\+?[0-9\s-]{5,}$/, "Invalid phone format").optional().or(z.literal("")),
    dateOfBirth: z.string().min(1, "Date of birth is required").refine((date) => new Date(date) <= new Date(), {
        message: "Date of birth cannot be in the future",
    }),
    gender: z.enum(["Male", "Female", "Other"], {
        message: "Please select a gender",
    }),
    address: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

export function CreatePatientDialog() {
    const [open, setOpen] = useState(false)
    const createPatientMutation = useCreatePatient()

    const form = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            gender: undefined,
            address: "",
        },
    })

    // Reset form when dialog closes
    const onOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            form.reset()
        }
    }

    const onSubmit = async (data: PatientFormData) => {
        try {
            await createPatientMutation.mutateAsync({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || undefined,
                phone: data.phone || undefined,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                address: data.address?.trim() || undefined,
            })
            toast.success("Patient created successfully")
            setOpen(false)
            form.reset()
        } catch (error) {
            // Error handled by the mutation hook or global error handler,
            // but we can add specific toast here if needed.
            console.error("Failed to create patient", error)
            toast.error("Failed to create patient")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Patient
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                    <DialogDescription>
                        Enter patient information to create a new record.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* First Name */}
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter patient's first name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Last Name */}
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter patient's last name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="patient@email.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Used for sending reports and notifications
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Phone */}
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+1 (555) 123-4567"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional contact number
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date of Birth & Sex Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createPatientMutation.isPending}>
                                {createPatientMutation.isPending ? "Creating..." : "Create Patient"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
