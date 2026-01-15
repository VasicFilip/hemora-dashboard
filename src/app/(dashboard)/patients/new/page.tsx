"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { useCreatePatient } from "@/lib/hooks"

const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  address: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

export default function NewPatientPage() {
  const router = useRouter()
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

  const onSubmit = async (data: PatientFormData) => {
    try {
      await createPatientMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address || undefined,
      })
      router.push('/patients')
    } catch (error) {
      // Error handled by the mutation hook
    }
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Patient</h1>
          <p className="text-muted-foreground">
            Enter patient information to create a new record
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Please provide the essential patient details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="flex items-center space-x-4 pt-4">
                  <Button type="submit" disabled={createPatientMutation.isPending}>
                    {createPatientMutation.isPending ? "Creating..." : "Create Patient"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/patients">Cancel</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}