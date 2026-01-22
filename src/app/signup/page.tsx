"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, Loader2, AlertCircle } from "lucide-react"

const signupSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters").trim(),
    organization_name: z.string().min(2, "Organization name must be at least 2 characters").trim(),
    email: z.string().email("Invalid email address").trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    admin_secret: z.string().min(1, "Administrative secret code is required"),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function TemporaryAdminSignup() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            full_name: "",
            organization_name: "",
            email: "",
            password: "",
            admin_secret: "",
        },
    })

    const onSubmit = async (data: SignupFormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            await api.adminSignup({
                email: data.email,
                password: data.password,
                full_name: data.full_name,
                organization_name: data.organization_name,
                admin_secret: data.admin_secret,
            })
            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err: any) {
            setError(err.message || "Failed to create admin account")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold">Admin Setup</CardTitle>
                    <CardDescription className="text-center">
                        Create a new administrative account. (Temporary Page)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertTitle className="text-green-800">Account Created!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Admin account has been successfully created. Redirecting to login in 3 seconds...
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    placeholder="John Doe"
                                    {...form.register("full_name")}
                                    disabled={isLoading}
                                    autoComplete="name"
                                />
                                {form.formState.errors.full_name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organization_name">Organization Name</Label>
                                <Input
                                    id="organization_name"
                                    placeholder="Hemora Clinic"
                                    {...form.register("organization_name")}
                                    disabled={isLoading}
                                    autoComplete="organization"
                                />
                                {form.formState.errors.organization_name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.organization_name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    {...form.register("email")}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...form.register("password")}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                                {form.formState.errors.password && (
                                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_secret">Administrative Secret Code</Label>
                                <Input
                                    id="admin_secret"
                                    type="password"
                                    placeholder="Enter the secret setup code"
                                    {...form.register("admin_secret")}
                                    disabled={isLoading}
                                    autoComplete="off"
                                />
                                {form.formState.errors.admin_secret && (
                                    <p className="text-sm text-red-500">{form.formState.errors.admin_secret.message}</p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    * This code is required to authorize the creation of an admin account.
                                </p>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Admin Account"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
                            Log in
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
