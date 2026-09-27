"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Download, Pencil, UserX } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ProtectedRoute } from "@/components/protected-route"
import { UserDetailView } from "@/components/user-detail-view"
import { UserForm } from "@/components/user-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { saveUser } from "@/lib/users/save-user"

export default function UserDetailPage() {
  const params = useParams<{ id: string }>()
  const userId = params?.id
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchUser = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, { cache: "no-store" })
      if (response.status === 404) {
        setUser(null)
        setNotFound(true)
        return
      }
      if (!response.ok) throw new Error("No se pudieron cargar los detalles del usuario")
      setUser(await response.json())
      setNotFound(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSave = async (data: any, curriculumFile?: File | null) => {
    setIsSaving(true)
    try {
      const { curriculumMessage } = await saveUser(userId, data, curriculumFile)
      toast.success("Usuario actualizado correctamente.", {
        description: curriculumMessage,
      })
      setShowEditForm(false)
      await fetchUser()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/users/${userId}/pdf`)
      if (!response.ok) throw new Error("No se pudo generar el PDF")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ficha_usuario_${userId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("PDF descargado correctamente")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const title = user ? `${user.nombre ?? ""} ${user.apellidos ?? ""}`.trim() : "Usuario"

  return (
    <ProtectedRoute>
      <AppShell
        title={title}
        actions={
          user ? (
            <>
              <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 rounded-none">
                <Download className="h-4 w-4" />
                Descargar PDF
              </Button>
              <Button onClick={() => setShowEditForm(true)} className="gap-2 rounded-none">
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            </>
          ) : null
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : notFound || !user ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <UserX className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold text-foreground">Usuario no encontrado</p>
              <p className="text-sm text-muted-foreground">
                El usuario con identificador {userId} no existe o ha sido eliminado.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/")} className="rounded-none">
              Volver al listado
            </Button>
          </div>
        ) : (
          <UserDetailView user={user} />
        )}

        <Dialog modal open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="flex max-h-[90vh] w-full max-w-7xl flex-col p-0 overflow-hidden">
            {user && (
              <UserForm
                key={user.id}
                user={user}
                onSave={handleSave}
                onCancel={() => setShowEditForm(false)}
                isSaving={isSaving}
              />
            )}
          </DialogContent>
        </Dialog>
      </AppShell>
    </ProtectedRoute>
  )
}
