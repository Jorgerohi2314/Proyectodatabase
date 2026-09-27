"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserTable } from "@/components/user-table"
import { UserSearchClient } from "@/components/user-search-client"
import type { SearchFilters } from "@/components/user-search"
import { ProtectedRoute } from "@/components/protected-route"
import { UserProfile } from "@prisma/client"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getUserLaboralYear, sortLaboralYears } from "@/lib/utils/laboral-year";

interface UserWithRelations extends UserProfile {
  socioEconomicData?: { id: string; composicionFamiliar: string; situacionEconomica: string; otrasCircunstancias?: string; }
  educationData?: { id:string; formacionAcademica: string; anioFinalizacion?: number; especificacionOtros?: string; experienciaLaboralPrevia?: string; }
  complementaryCourses?: Array<{ id: string; nombreCurso: string; duracionHoras: number; entidad: string; fechaRealizacion: Date; }>
  incomeMembers?: Array<{ id: string; numero: number; tipo: string; cantidad: number; }>
  diaryEntries?: Array<{ date: Date }>
  effectiveUpdate?: string | Date
  totalHoras?: number
}

export default function Home() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLaboralYear, setActiveLaboralYear] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    if (!activeLaboralYear) return users
    return users.filter(user => {
      const latestDiaryDate = user.diaryEntries?.[0]?.date
      return getUserLaboralYear(user.updatedAt, latestDiaryDate) === activeLaboralYear
    })
  }, [users, activeLaboralYear])

  const usersByYear = useMemo(() => {
    const groups: Record<string, UserWithRelations[]> = {}
    users.forEach(user => {
      const latestDiaryDate = user.diaryEntries?.[0]?.date
      const year = getUserLaboralYear(user.updatedAt, latestDiaryDate)
      if (year && !groups[year]) groups[year] = []
      if (year) groups[year].push(user)
    })
    return groups
  }, [users])

  const fetchUsers = async (filters?: SearchFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value as string)
        })
      }
      const response = await fetch(`/api/users?${params}`)
      if (response.ok) setUsers(await response.json())
      else toast.error("Error al cargar usuarios")
    } catch (error) {
      toast.error("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (filters: SearchFilters) => fetchUsers(filters)
  const handleClear = () => fetchUsers()

  const handleCreateUser = () => router.push("/usuarios/nuevo")

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <ProtectedRoute>
      <AppShell
        title="Usuarios"
        actions={
          <Button onClick={handleCreateUser} className="gap-2 rounded-none">
            <Plus className="h-4 w-4" />
            Crear Usuario
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Años:</span>
          <button
            onClick={() => setActiveLaboralYear(null)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeLaboralYear === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            Todos
          </button>
          {sortLaboralYears(Object.keys(usersByYear)).map((year) => (
            <button
              key={year}
              onClick={() => setActiveLaboralYear(year)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeLaboralYear === year
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {year} <span className="opacity-70">({usersByYear[year].length})</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <UserSearchClient onSearch={handleSearch} onClear={handleClear} />
              <Card className="border-0 shadow-xl bg-[#F4F1F8]/60 dark:bg-gray-800/60 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-slate-800 dark:text-white">Lista de Usuarios</CardTitle>
                    {activeLaboralYear && (
                      <button
                        onClick={() => setActiveLaboralYear(null)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Ver todos los años
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <UserTable users={filteredUsers} loading={loading} />
                </CardContent>
              </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}
