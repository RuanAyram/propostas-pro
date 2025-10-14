"use client"

import { AccountSettings } from "@stackframe/stack"
import { ReturnHome } from "@/components/return-home"
import { HomeIcon } from "lucide-react"

export default function SignInPage() {
  return (
    <AccountSettings
    fullPage={true}
    extraItems={[{
      title: ' Home',
      icon: <HomeIcon />,
      content: <ReturnHome />,  
      id: 'return-home',
    }]}
    />
  );
}
