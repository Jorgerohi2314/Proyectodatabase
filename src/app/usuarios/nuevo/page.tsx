"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { ProtectedRoute } from "@/components/protected-route"
import { UserForm } from "@/components/user-form"
import { saveUser } from "@/lib/users/save-user"

export default function NewUserPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: any, curriculumFile?: File | null) => {
    setIsSaving(true)
    try {
      const { userId, curriculumMessage } = await saveUser(null, data, curriculumFile)
      toast.success("Usuario creado correctamente.", {
        description: curriculumMessage,
      })
      router.push(`/usuarios/${userId}`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <AppShell title="Crear Usuario">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F4F1F8]/60 shadow-xl backdrop-blur-xl dark:bg-gray-800/60">
          <UserForm
            onSave={handleSave}
            onCancel={() => router.push("/")}
            isSaving={isSaving}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}
