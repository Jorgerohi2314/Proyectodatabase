"use client"

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-none border border-gray-200 dark:border-gray-700 bg-[#F4F1F8] dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center cursor-pointer"
      aria-label="Cambiar entre modo claro y oscuro"
      title="Cambiar tema"
    >
      <Sun
        className={`w-4 h-4 text-yellow-500 transition-all duration-300 ${
          isDark ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
        }`}
      />
      <Moon
        className={`w-4 h-4 text-blue-500 transition-all duration-300 absolute ${
          isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
        }`}
      />
    </button>
  )
}