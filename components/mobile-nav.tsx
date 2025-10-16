"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, FileSignature, Receipt } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Propostas",
      icon: FileText,
      active: pathname === "/"
    },
    {
      href: "/contratos",
      label: "Contratos",
      icon: FileSignature,
      active: pathname === "/contratos"
    },
    {
      href: "/recebimentos",
      label: "Recebimentos",
      icon: Receipt,
      active: pathname === "/recebimentos"
    }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex items-center justify-around py-2">
        {routes.map((route) => {
          const Icon = route.icon
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                route.active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                route.active && "fill-secondary"
              )} />
              <span>{route.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
