"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Loader2, PlusCircle } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

const formSchema = z.object({
    name: z.string().min(2, "Clinic name must be at least 2 characters").trim(),
    email: z.string().email("Invalid email address").trim(),
    phone: z.string().regex(/^\+?[0-9\s-]{5,}$/, "Invalid phone format (e.g. +123 456)"),
    address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address is too long").trim(),
})

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { t } = useTranslation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await api.createOrganization(values)
            toast.success(t('onboarding.success'))
            window.location.href = "/"
        } catch (error) {
            toast.error(t('onboarding.failed'))
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex  w-screen items-center justify-center">
            <div className="container flex h-screen w-screen flex-col items-center justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">{t('onboarding.title')}</CardTitle>
                        <CardDescription>
                            {t('onboarding.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('onboarding.clinic_name')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Clinic" {...field} />
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
                                            <FormLabel>{t('onboarding.contact_email')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="clinic@example.com" type="email" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                {t('onboarding.email_hint')}
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
                                            <FormLabel>{t('onboarding.phone')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+41 234 567 890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('onboarding.address')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Musterstrasse 1, Stadt" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('onboarding.creating')}
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            {t('onboarding.create')}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
