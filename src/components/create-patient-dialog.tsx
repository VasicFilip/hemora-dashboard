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
import { useTranslation } from "@/lib/i18n-context"

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
    const { t } = useTranslation()

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
            toast.success(t('create_patient.success'))
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error("Failed to create patient", error)
            toast.error(t('create_patient.failed'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('create_patient.trigger')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('create_patient.title')}</DialogTitle>
                    <DialogDescription>
                        {t('create_patient.description')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('create_patient.first_name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('create_patient.first_name_placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('create_patient.last_name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('create_patient.last_name_placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('create_patient.email')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={t('create_patient.email_placeholder')}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t('create_patient.email_hint')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('create_patient.phone')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('create_patient.phone_placeholder')}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t('create_patient.phone_hint')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('create_patient.dob')}</FormLabel>
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
                                        <FormLabel>{t('create_patient.gender')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('create_patient.gender_placeholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Male">{t('create_patient.male')}</SelectItem>
                                                <SelectItem value="Female">{t('create_patient.female')}</SelectItem>
                                                <SelectItem value="Other">{t('create_patient.other')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                {t('create_patient.cancel')}
                            </Button>
                            <Button type="submit" disabled={createPatientMutation.isPending}>
                                {createPatientMutation.isPending ? t('create_patient.creating') : t('create_patient.create')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
