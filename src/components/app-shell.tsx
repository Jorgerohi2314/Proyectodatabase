"use client"

import * as React from "react"
import Link from "next/link"
import { LogOut, LayoutDashboard, BarChart3 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import Clock from "@/components/clock"
import { cn } from "@/lib/utils"

export interface AppShellProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export function AppShell({ children, title, actions }: AppShellProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const nav = [
    { label: "Inicio", href: "/", icon: LayoutDashboard },
    { label: "Estadísticas", href: "/stats", icon: BarChart3 },
  ]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground font-bold">
              BD
            </div>
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground">Base de Datos</span>
              <span className="text-xs text-sidebar-foreground/60">Gestión de Usuarios</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild variant="outline">
                <button onClick={logout} className="w-full">
                  <LogOut />
                  <span>Cerrar sesión</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="rounded-none" />
            <span className="text-lg font-semibold text-foreground">{title ?? "Panel"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-sm text-muted-foreground sm:inline">
              <Clock />
            </span>
            <ThemeToggle />
            {actions}
          </div>
        </header>
        <main className={cn("flex flex-1 flex-col gap-6 p-4 sm:p-6")}>{children}</main>
      </SidebarInset>

      <SidebarRail />
    </SidebarProvider>
  )
}
