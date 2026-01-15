"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, Loader2, AlertCircle } from "lucide-react"

export default function TemporaryAdminSignup() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const full_name = formData.get("full_name") as string
        const organization_name = formData.get("organization_name") as string
        const admin_secret = formData.get("admin_secret") as string

        try {
            await api.adminSignup({
                email,
                password,
                full_name,
                organization_name,
                admin_secret,
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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input id="full_name" name="full_name" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organization_name">Organization Name</Label>
                                <Input id="organization_name" name="organization_name" placeholder="Hemora Clinic" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_secret">Administrative Secret Code</Label>
                                <Input
                                    id="admin_secret"
                                    name="admin_secret"
                                    type="password"
                                    placeholder="Enter the secret setup code"
                                    required
                                />
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
