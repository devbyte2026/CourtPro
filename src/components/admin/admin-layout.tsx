"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Users,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Calendario", href: "/admin/calendar", icon: Calendar },
  { label: "Reservas", href: "/admin/reservas", icon: ListTodo },
  { label: "Caja", href: "/admin/caja", icon: CreditCard },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Métricas", href: "/admin/metricas", icon: BarChart3 },
  { label: "Suscripción", href: "/admin/suscripcion", icon: CreditCard },
  { label: "Configuración", href: "/admin/config", icon: Settings },
];

interface Props {
  tenantSlug: string;
  children: React.ReactNode;
}

export function AdminLayout({ tenantSlug, children }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "bg-card border-r flex flex-col transition-all",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-14 border-b flex items-center px-4">
          {!collapsed && (
            <span className="font-semibold text-sm">Panel Admin</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 hover:bg-muted rounded"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={`/${tenantSlug}/admin`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t">
          <Link
            href={`/${tenantSlug}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted"
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Ver página pública</span>}
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
