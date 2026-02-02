"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import {
  Users,
  Upload,
  FileText,
  Activity,
  Settings,
  Home,
  LogOut,
  Shield,
  UserCog,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Upload Analysis", href: "/upload", icon: Upload },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
]

const adminNavigation = [
  { name: "Admin Dashboard", href: "/admin", icon: Shield },
  { name: "System Analytics", href: "/admin/analytics", icon: Activity },
  { name: "User Management", href: "/admin/users", icon: UserCog },
  { name: "Org Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar({ isMobile = false, className }: { isMobile?: boolean, className?: string }) {
  const pathname = usePathname()
  const { user, isLoading, logout, hasRole } = useAuth()

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className={cn(
      "flex h-screen flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      !isMobile && "w-64 hidden lg:flex",
      isMobile && "w-full",
      className
    )}>
      {/* Logo */}
      {!isMobile && (
        <div className="flex h-16 items-center border-b border-border/40 px-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">hemora.ch</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-muted text-foreground"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}

        {/* Admin Section */}
        {hasRole('admin') && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </p>
            </div>
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-muted text-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/40 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">
                {user ? getUserInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="text-sm flex-1 min-w-0">
              <p className="font-medium truncate">
                {isLoading ? 'Loading...' : user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isLoading ? '...' : user?.email || ''}
              </p>
              {user && (
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              )}
            </div>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}