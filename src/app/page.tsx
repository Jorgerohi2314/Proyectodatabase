"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserTable } from "@/components/user-table"
import { UserSearchClient } from "@/components/user-search-client"
import type { SearchFilters } from "@/components/user-search"
import { UserForm } from "@/components/user-form"
import { UserDetailView } from "@/components/user-detail-view"
import { Plus, Users, CardSimIcon } from "lucide-react"
import { UserProfile } from "@prisma/client"
import { toast } from "sonner"

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardSimIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <UserSearchClient onSearch={handleSearch} onClear={handleClear} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <UserForm
              onSave={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedUser && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
  )
}