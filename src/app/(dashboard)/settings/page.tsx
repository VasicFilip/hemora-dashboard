"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  useUser,
  useUpdateProfile,
  useChangePassword,
  useOrganization,
  useUpdateOrganization,
  useUpdateSettings
} from "@/lib/hooks"
import type { UserMeResponse } from "@/types/index"
import { SUPPORTED_LANGUAGES } from "@/lib/languages"
import {
  User,
  Users,
  Lock,
  Building,
  Settings as SettingsIcon,
  Bell,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react"
import { showToast } from "@/lib/toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useEffect } from "react"

export default function SettingsPage() {
  const { data: userData } = useUser()
  const user = userData as UserMeResponse | undefined
  const { data: org } = useOrganization()

  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const updateSettings = useUpdateSettings()
  const updateOrg = useUpdateOrganization()

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  })

  const [profileData, setProfileData] = useState({
    name: "",
    email: ""
  })

  // Local state for settings to avoid flicker
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || ""
      })
      if (user.settings) {
        setLocalSettings(user.settings)
      }
    }
  }, [user])

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(profileData)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast.error("Passwords do not match")
      return
    }
    changePassword.mutate({
      current_password: passwordData.old_password,
      new_password: passwordData.new_password
    })
    setPasswordData({ old_password: "", new_password: "", confirm_password: "" })
  }

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    updateSettings.mutate(newSettings)
  }

  if (!user || !org) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading your settings...</p>
        </div>
      </div>
    )
  }

  const isAdmin = user.role === 'admin'

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your personal profile, security preferences, and organization.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 lg:w-auto w-full overflow-x-auto justify-start">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> Preferences
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="organization" className="gap-2">
              <Building className="h-4 w-4" /> Organization
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-lg ring-1 ring-white/10 bg-card/40 backdrop-blur-xl transition-all hover:shadow-primary/5">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public profile and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Dr. John Doe"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="bg-secondary/20 border-none focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@hospital.com"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-secondary/20 border-none focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md ring-1 ring-white/10 bg-secondary/10">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Role & Permissions</CardTitle>
                <CardDescription>Your current access level in the organization.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center gap-2">
                <Badge className="capitalize px-4 py-1 text-sm font-bold bg-primary/20 text-primary border-none">
                  {user?.role} Access
                </Badge>
                <span className="text-sm text-muted-foreground">member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-lg ring-1 ring-white/10 bg-card/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Secure your account with a strong password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="old-password">Current Password</Label>
                  <Input
                    id="old-password"
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    className="bg-secondary/20 border-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="bg-secondary/20 border-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="bg-secondary/20 border-none"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={changePassword.isPending}>
                  {changePassword.isPending ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-none shadow-lg ring-1 ring-white/10 bg-card/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Interface & Language</CardTitle>
              <CardDescription>Customize how Hemora looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Analysis Engine Language</Label>
                      <p className="text-xs text-muted-foreground">Default language for new blood analyses. Fixed to German/English.</p>
                    </div>
                    <Select
                      value={localSettings.language || "de"}
                      onValueChange={(v) => handleSettingChange('language', v)}
                    >
                      <SelectTrigger className="w-48 bg-secondary/20 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive alerts for critical clinical results.</p>
                    </div>
                    <Button
                      variant={(localSettings.notifications ?? true) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('notifications', !(localSettings.notifications ?? true))}
                    >
                      {(localSettings.notifications ?? true) ? "On" : "Off"}
                    </Button>
                  </div>
                  <Separator className="bg-white/5" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold">Compact View</Label>
                      <p className="text-xs text-muted-foreground">Optimized interface for high-density data management.</p>
                    </div>
                    <Button
                      variant={localSettings.compactMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('compactMode', !localSettings.compactMode)}
                    >
                      {localSettings.compactMode ? "Active" : "Disabled"}
                    </Button>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        {isAdmin && (
          <TabsContent value="organization" className="space-y-6">
            <Card className="border-none shadow-lg ring-1 ring-white/10 bg-card/40 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Manage your clinic's identity and settings.</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 font-bold">
                    PREMIUM PLAN
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input
                      defaultValue={org?.name}
                      className="bg-secondary/20 border-none font-semibold text-lg py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      defaultValue={org?.email}
                      className="bg-secondary/20 border-none py-6"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-white/5 py-4 border-t border-white/5">
                <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save Organization
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none bg-indigo-500/5 ring-1 ring-indigo-500/10">
              <CardHeader>
                <CardTitle className="text-indigo-400 flex items-center gap-2 font-bold">
                  <Users className="h-5 w-5" /> Team Members
                </CardTitle>
                <CardDescription>Invite and manage clinicians in your team.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 py-4 rounded-lg bg-white/5 px-4 mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{org?.name} Team</p>
                    <p className="text-xs text-muted-foreground">1/10 Seats Occupied</p>
                  </div>
                  <Button size="sm">Invite Member</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
