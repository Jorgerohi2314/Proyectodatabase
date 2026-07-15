"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserTable } from "@/components/user-table"
import { UserSearchClient } from "@/components/user-search-client"
import type { SearchFilters } from "@/components/user-search"
import { UserForm } from "@/components/user-form"
import { UserDetailView } from "@/components/user-detail-view"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { UserProfile } from "@prisma/client"
import { toast } from "sonner"
import Header from "@/components/header";

interface UserWithRelations extends UserProfile {
  socioEconomicData?: { id: string; composicionFamiliar: string; situacionEconomica: string; otrasCircunstancias?: string; }
  educationData?: { id:string; formacionAcademica: string; anioFinalizacion?: number; especificacionOtros?: string; experienciaLaboralPrevia?: string; }
  complementaryCourses?: Array<{ id: string; nombreCurso: string; duracionHoras: number; entidad: string; fechaRealizacion: Date; }>
  incomeMembers?: Array<{ id: string; numero: number; tipo: string; cantidad: number; }>
}

export default function Home() {
  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewForm, setShowViewForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(null)
  const [isSaving, setIsSaving] = useState(false)
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

  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowCreateForm(true)
  }

  const handleSaveUser = async (data: any, curriculumFile?: File | null) => {
    setIsSaving(true)
    const isUpdating = !!selectedUser?.id
    const endpoint = isUpdating ? `/api/users/${selectedUser!.id}` : "/api/users"
    const method = isUpdating ? "PUT" : "POST"

    try {
      const userResponse = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.error || `Error al ${isUpdating ? 'actualizar' : 'crear'} el usuario`)
      }

      const savedUser = await userResponse.json()
      const userId = savedUser.id
      let curriculumMessage = ""

      if (curriculumFile && userId) {
        const formData = new FormData()
        formData.append("curriculum", curriculumFile)
        
        const fileResponse = await fetch(`/api/users/${userId}/curriculum`, {
          method: "POST",
          body: formData,
        })

        if (fileResponse.ok) {
          curriculumMessage = "Currículum subido con éxito."
        } else {
          const fileError = await fileResponse.json()
          curriculumMessage = `El perfil se guardó, pero falló la subida del currículum: ${fileError.error}`
        }
      }
      
      toast.success(`Usuario ${isUpdating ? 'actualizado' : 'creado'} correctamente.`, {
        description: curriculumMessage,
      })
      
      setShowCreateForm(false)
      setShowEditForm(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const response = await fetch(`/api/users/${id}`, { method: "DELETE" })
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
    setSelectedUser(user as UserWithRelations)
    setShowEditForm(true)
  }
  
  const handleView = async (user: UserProfile) => {
    try {
      const response = await fetch(`/api/users/${user.id}`)
      if (response.ok) {
        setSelectedUser(await response.json())
        setShowViewForm(true)
      } else {
        toast.error("Error al cargar los detalles del usuario")
      }
    } catch (error) {
      toast.error("Error al cargar los detalles del usuario")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto p-6 space-y-8 z-10">
        <Header onCreateUser={handleCreateUser} />
          <UserSearchClient onSearch={handleSearch} onClear={handleClear} />
          <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-xl text-slate-800">Lista de Usuarios</CardTitle></CardHeader>
            <CardContent>
              <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} onDownloadPDF={handleDownloadPDF} loading={loading} />
            </CardContent>
          </Card>

          <Dialog modal={true} open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="max-w-7xl w-full max-h-[90vh] p-0 overflow-hidden">
              <UserForm
                onSave={handleSaveUser}
                onCancel={() => setShowCreateForm(false)}
                isSaving={isSaving}
              />
            </DialogContent>
          </Dialog>

          <Dialog modal={true} open={showEditForm} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setShowEditForm(false);
              setSelectedUser(null);
            }
          }}>
            <DialogContent className="max-w-7xl w-full max-h-[90vh] p-0 overflow-hidden">
              {selectedUser && <UserForm
                key={selectedUser.id}
                user={selectedUser}
                onSave={handleSaveUser}
                onCancel={() => { setShowEditForm(false); setSelectedUser(null); }}
                isSaving={isSaving}
              />}
            </DialogContent>
          </Dialog>

          <Dialog open={showViewForm} onOpenChange={(isOpen) => {
              if (!isOpen) {
                  setShowViewForm(false);
                  setSelectedUser(null);
              }
          }}>
              <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  {selectedUser && <UserDetailView user={selectedUser} onClose={() => { setShowViewForm(false); setSelectedUser(null); }} />}
              </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
