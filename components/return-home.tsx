import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export function ReturnHome() {
  return (
    <Link href="/">
      <Button variant="outline" size="sm">
        <Home className="mr-2 h-4 w-4" />
        Voltar ao Início
      </Button>
    </Link>
  )
}