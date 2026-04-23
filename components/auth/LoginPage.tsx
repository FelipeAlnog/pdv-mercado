"use client"

import Link from "next/link"
import {  IconDashboard } from "@tabler/icons-react"

import { Stethoscope } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 right-0 h-[600px] w-[600px] rounded-full bg-[#9EEA6C]/8 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-teal-500/6 blur-[100px]" />
      </div>

      {/* Theme toggle — top-right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo — top-left */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9EEA6C]">
            <IconDashboard className="h-4 w-4 text-zinc-900" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-white">PDVSaaS</span>
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-zinc-900/60 backdrop-blur-sm p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  )
}
