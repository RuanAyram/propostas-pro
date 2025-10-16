"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, FileSignature, Receipt } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Propostas Comerciais",
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
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => {
        const Icon = route.icon
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              route.active
                ? "text-foreground underline"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{route.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
