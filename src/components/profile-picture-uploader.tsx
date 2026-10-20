"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, X, Upload, Eye, Trash2, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfilePictureUploaderProps {
  userId?: string
  existingProfilePictureFileName?: string | null
  onFileSelected?: (file: File | null) => void
  onUploadComplete?: (fileName: string) => void
  onDeleteComplete?: () => void
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function ProfilePictureUploader({
  userId,
  existingProfilePictureFileName,
  onFileSelected,
  onUploadComplete,
  onDeleteComplete,
}: ProfilePictureUploaderProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Versión para romper la caché del navegador al cambiar la imagen
  const [version, setVersion] = useState(() => Date.now())

  const hasProfilePicture = existingProfilePictureFileName !== null && existingProfilePictureFileName !== undefined
  const serverUrl = userId ? `/api/users/${userId}/profile-picture/file?v=${version}` : null

  const clearSelection = useCallback(() => {
    setFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (inputRef.current) inputRef.current.value = ""
    onFileSelected?.(null)
  }, [onFileSelected])

  const uploadFile = useCallback(async (fileToUpload: File) => {
    const formData = new FormData()
    formData.append("profilePicture", fileToUpload)

    const response = await fetch(`/api/users/${userId}/profile-picture`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || "Error al subir la foto de perfil")
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || "Error desconocido")
    }

    onUploadComplete?.(result.data.fileName)
    setVersion(Date.now())
    return result.data.fileName
  }, [userId, onUploadComplete])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: "Solo se permiten imágenes JPG, PNG, WebP o GIF.",
      })
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      toast({
        variant: "destructive",
        title: "Archivo demasiado grande",
        description: "El archivo no debe superar los 5MB.",
      })
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    // Si el usuario ya existe (tiene id) se sube inmediatamente.
    // Si es un usuario nuevo, se guarda el archivo para subirlo al guardar el perfil.
    if (!userId) {
      setFile(selectedFile)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(selectedFile)
      })
      onFileSelected?.(selectedFile)
      return
    }

    setIsUploading(true)
    try {
      await uploadFile(selectedFile)
      toast({
        title: "Éxito",
        description: "Foto de perfil subida correctamente",
      })
      clearSelection()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al subir",
        description: error.message,
      })
      if (inputRef.current) inputRef.current.value = ""
    } finally {
      setIsUploading(false)
    }
  }, [userId, uploadFile, clearSelection, onFileSelected, toast])

  const handleDelete = useCallback(async () => {
    if (!userId) return
    if (!confirm("¿Seguro que quieres eliminar la foto de perfil? Esta acción no se puede deshacer.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Error al eliminar la foto de perfil")
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Error desconocido")
      }

      onDeleteComplete?.()
      onFileSelected?.(null)
      setVersion(Date.now())
      toast({
        title: "Éxito",
        description: "Foto de perfil eliminada correctamente",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message,
      })
    } finally {
      setIsDeleting(false)
    }
  }, [userId, onDeleteComplete, onFileSelected, toast])

  const previewSrc = previewUrl ?? serverUrl

  return (
    <div className="space-y-4">
      {/* Vista previa */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={previewUrl ? "Vista previa de la foto seleccionada" : "Foto de perfil actual"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {previewUrl
              ? "Nueva foto seleccionada"
              : hasProfilePicture
                ? existingProfilePictureFileName
                : "Sin foto de perfil"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {previewUrl
              ? userId
                ? "Subida en curso..."
                : "Se subirá al guardar el usuario"
              : hasProfilePicture
                ? "Foto actual"
                : "No hay foto subida"}
          </p>
        </div>
      </div>

      {/* Selección de archivo. Se usa un <label> (nunca dispara submit del form)
          y el input va con form="none" para quedar fuera del formulario. */}
      <div className="space-y-2">
        <Label
          htmlFor="profile-picture-input"
          className="block cursor-pointer"
        >
          Seleccionar imagen
        </Label>
        <div className="relative">
          <Input
            id="profile-picture-input"
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
            disabled={isUploading || isDeleting}
            form="none"
          />
          <Label
            htmlFor="profile-picture-input"
            className="inline-flex w-full cursor-pointer items-center justify-start gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Upload className="h-4 w-4" />
            {hasProfilePicture || file ? "Cambiar foto" : "Seleccionar archivo"}
          </Label>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Formatos permitidos: JPG, PNG, WebP, GIF. Tamaño máximo: 5MB.
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {file && !userId && (
          <>
            <span className="text-sm text-green-600 dark:text-green-400 flex-1">
              ✓ Foto lista para subir al guardar usuario
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                clearSelection()
              }}
              disabled={isUploading || isDeleting}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}

        {hasProfilePicture && !file && (
          <>
            {serverUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  window.open(serverUrl, "_blank")
                }}
                disabled={isDeleting}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver foto
              </Button>
            )}
            {userId && (
              <Button
                type="button"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
