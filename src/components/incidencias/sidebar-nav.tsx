"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  ChevronDown,
  CircleUserRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/sign-out";

const links = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/incidents/new", label: "Registrar incidencia", icon: PlusCircle },
  { href: "/incidents", label: "Consultar incidencias", icon: ListChecks },
  { href: "/reports", label: "Reportes automaticos", icon: BarChart3 },
  { href: "/settings", label: "Configuracion", icon: Settings }
] as const;

type SidebarNavProps = {
  userEmail?: string;
};

export function SidebarNav({ userEmail }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-full flex-col gap-8 bg-sidebar/95 px-6 pb-8 pt-8 text-sidebar-foreground backdrop-blur">
      <div className="flex flex-col gap-6">
        <Link href="/dashboard" className="flex items-center gap-4 no-underline">
          <div className="relative h-16 w-16 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg">
            <Image
              src="/logo_municipalidad.png"
              alt="Escudo Municipalidad de Huancayo"
              fill
              className="object-contain p-2"
            />
          </div>
          <div className="leading-tight text-white">
            <p className="text-lg font-semibold tracking-wide">Municipalidad de Huancayo</p>
            <span className="text-xs uppercase tracking-wider text-white/70">Gestion de incidencias 360</span>
          </div>
        </Link>

        <div className="rounded-3xl border border-white/15 bg-white/5 p-4 text-white/80 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Atencion en linea</p>
          <p className="mt-2 text-sm">
            Monitorea incidentes y coordina respuestas rapidas para los vecinos de nuestra provincia.
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} prefetch className="no-underline">
              <Button
                variant="ghost"
                className={cn(
                  "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white",
                  isActive && "bg-white/15 text-white shadow-inner"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 -rotate-90 opacity-0 transition-all group-hover:opacity-60",
                    isActive && "opacity-80"
                  )}
                />
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
          <p className="font-semibold uppercase tracking-wide text-white/60">Soporte rapido</p>
          <p className="mt-1 leading-relaxed">
            Consulta el manual y descarga reportes para compartir con gerencias y regidurías.
          </p>
        </div>

        <Link href="/manual" className="no-underline">
          <Button
            variant="ghost"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
          >
            <FileText className="h-4 w-4" />
            Manual de usuario
          </Button>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
          <div className="flex items-center gap-3">
            <CircleUserRound className="h-5 w-5 text-white" />
            <div className="flex-1 text-xs">
              <p className="font-semibold uppercase tracking-wide text-white/60">Sesion activa</p>
              <p className="truncate text-white/80">{userEmail ?? "Usuario municipal"}</p>
            </div>
          </div>
          <form action={signOutAction} className="mt-3">
            <Button
              type="submit"
              variant="ghost"
              className="flex w-full items-center justify-start gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
