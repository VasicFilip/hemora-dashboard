"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { HemoraLogo } from "@/components/HemoraLogo"
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

export function Sidebar({ isMobile = false, className }: { isMobile?: boolean, className?: string }) {
  const pathname = usePathname()
  const { user, isLoading, logout, hasRole } = useAuth()
  const { t } = useTranslation()

  const navigation = [
    { name: t('nav.dashboard'), href: "/", icon: Home },
    { name: t('nav.patients'), href: "/patients", icon: Users },
    { name: t('nav.upload'), href: "/upload", icon: Upload },
    { name: t('nav.reports'), href: "/reports", icon: FileText },
    { name: t('nav.analytics'), href: "/analytics", icon: Activity },
    { name: t('nav.settings'), href: "/settings", icon: Settings },
  ]

  const adminNavigation = [
    { name: t('nav.admin_dashboard'), href: "/admin", icon: Shield },
    { name: t('nav.system_analytics'), href: "/admin/analytics", icon: Activity },
    { name: t('nav.user_management'), href: "/admin/users", icon: UserCog },
    { name: t('nav.audit_logs'), href: "/admin/audit-logs", icon: FileText },
    { name: t('nav.org_settings'), href: "/admin/settings", icon: Settings },
  ]

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className={cn(
      "flex h-screen flex-col bg-white/85 dark:bg-black/30 backdrop-blur-[16px] border-r border-black/10 dark:border-white/20 dark:[box-shadow:inset_-1px_0_0_rgba(255,255,255,0.1)]",
      !isMobile && "w-64 hidden lg:flex",
      isMobile && "w-full",
      className
    )}>
      {/* Logo */}
      {!isMobile && (
        <div className="flex h-16 items-center border-b border-border/40 px-6">
          <HemoraLogo size="xl" showText={true} />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
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
                {t('nav.administration')}
              </p>
            </div>
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
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
                {isLoading ? t('nav.loading') : user?.name || t('nav.user')}
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
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}
