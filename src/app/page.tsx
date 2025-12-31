"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserTable } from "@/components/user-table"
import { UserSearchClient } from "@/components/user-search-client"
import type { SearchFilters } from "@/components/user-search"
import { UserForm } from "@/components/user-form"
import { UserDetailView } from "@/components/user-detail-view"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Users, CardSimIcon, BarChart3, LogOut } from "lucide-react"
import { UserProfile } from "@prisma/client"
import { toast } from "sonner"
import Link from "next/link"

interface UserWithRelations extends UserProfile {
  socioEconomicData?: {
    id: string
    composicionFamiliar: string
    situacionEconomica: string
    otrasCircunstancias?: string
  }
  educationData?: {
    id: string
    formacionAcademica: string
    anioFinalizacion?: number
    especificacionOtros?: string
    experienciaLaboralPrevia?: string
  }
  complementaryCourses?: Array<{
    id: string
    nombreCurso: string
    duracionHoras: number
    entidad: string
    fechaRealizacion: Date
  }>
  incomeMembers?: Array<{
    id: string
    numero: number
    tipo: string
    cantidad: number
  }>
}

export default function Home() {
  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewForm, setShowViewForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(null)
  const { logout } = useAuth()

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
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("Error al cargar usuarios")
      }
    } catch (error) {
      toast.error("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (filters: SearchFilters) => {
    fetchUsers(filters)
  }

  const handleClear = () => {
    fetchUsers()
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          toast.success("Usuario eliminado correctamente")
          fetchUsers()
        } else {
          toast.error("Error al eliminar usuario")
        }
      } catch (error) {
        toast.error("Error al eliminar usuario")
      }
    }
  }

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `ficha_usuario_${id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("PDF descargado correctamente")
      } else {
        toast.error("Error al generar PDF")
      }
    } catch (error) {
      toast.error("Error al generar PDF")
    }
  }

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user)
    setShowEditForm(true)
  }

  const handleView = async (user: UserProfile) => {
    try {
      const response = await fetch(`/api/users/${user.id}`)
      if (response.ok) {
        const fullUserData = await response.json()
        setSelectedUser(fullUserData)
        setShowViewForm(true)
      } else {
        toast.error("Error al cargar los detalles del usuario")
      }
    } catch (error) {
      toast.error("Error al cargar los detalles del usuario")
    }
  }

  const handleCreateUser = async (data: any) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Usuario creado correctamente")
        setShowCreateForm(false)
        fetchUsers()
      } else {
        toast.error("Error al crear usuario")
      }
    } catch (error) {
      toast.error("Error al crear usuario")
    }
  }

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Usuario actualizado correctamente")
        setShowEditForm(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast.error("Error al actualizar usuario")
      }
    } catch (error) {
      toast.error("Error al actualizar usuario")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto p-6 space-y-8 relative z-10">
          <div className="sticky top-4 z-40 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white">
                <CardSimIcon className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                Gestión de Usuarios
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="flex items-center gap-2 bg-white/50 border-white/50 hover:bg-white/80">
                <Link href="/stats">
                  <BarChart3 className="h-4 w-4" />
                  Estadísticas
                </Link>
              </Button>
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 shadow-indigo-500/20">
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          <UserSearchClient onSearch={handleSearch} onClear={handleClear} />

          <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Lista de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDownloadPDF={handleDownloadPDF}
                loading={loading}
              />
            </CardContent>
          </Card>

          {showCreateForm && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/40 ring-1 ring-white/60">
                <UserForm
                  onSave={handleCreateUser}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </div>
          )}

          {showEditForm && selectedUser && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/40 ring-1 ring-white/60">
                <UserForm
                  key={selectedUser.id}
                  user={selectedUser}
                  onSave={handleUpdateUser}
                  onCancel={() => {
                    setShowEditForm(false)
                    setSelectedUser(null)
                  }}
                />
              </div>
            </div>
          )}

          {showViewForm && selectedUser && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/40 ring-1 ring-white/60">
                <UserDetailView
                  user={selectedUser}
                  onClose={() => {
                    setShowViewForm(false)
                    setSelectedUser(null)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}