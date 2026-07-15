"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, File as FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface CurriculumUploaderProps {
  userId: string | undefined // User ID is needed for the upload endpoint
  existingCurriculumUrl?: string | null
  onUploadComplete: (url: string) => void
  onDeleteComplete: () => void
}

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'application/vnd.oasis.opendocument.text': ['.odt'],
}

export function CurriculumUploader({ 
  userId, 
  existingCurriculumUrl,
  onUploadComplete,
  onDeleteComplete
}: CurriculumUploaderProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const firstError = fileRejections[0].errors[0]
      toast({
        variant: "destructive",
        title: "Archivo no válido",
        description: firstError.code === 'file-too-large'
          ? `El archivo es demasiado grande. El tamaño máximo es de ${MAX_SIZE_MB}MB.`
          : `Tipo de archivo no permitido. Solo se aceptan documentos (pdf, doc, docx, txt, odt).`,
      })
      return
    }
    
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return
    if (!userId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Espera a que el usuario sea creado antes de subir un archivo.",
        });
        return;
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("curriculum", file)

    try {
      const response = await fetch(`/api/users/${userId}/curriculum`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falló la subida del currículum")
      }

      const { url } = await response.json()
      onUploadComplete(url)
      setFile(null)
      toast({
        title: "Éxito",
        description: "Currículum subido correctamente.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al subir",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!userId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${userId}/curriculum`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falló la eliminación del currículum")
      }

      onDeleteComplete()
      toast({
        title: "Éxito",
        description: "Currículum eliminado correctamente.",
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
  }

  const currentFileUrl = file ? URL.createObjectURL(file) : existingCurriculumUrl
  const currentFileName = file ? file.name : (existingCurriculumUrl?.split('/').pop() || "Currículum existente")

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        {isDragActive ? (
          <p className="mt-2 text-gray-600 dark:text-gray-300">Suelta el archivo aquí...</p>
        ) : (
          <p className="mt-2 text-gray-600 dark:text-gray-300">Arrastra y suelta un archivo (pdf, doc, txt...) o haz clic para seleccionarlo.</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">Tamaño máximo: {MAX_SIZE_MB}MB</p>
      </div>

      {currentFileUrl && (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{currentFileName}</span>
          </div>
          {file ? ( // Si es un archivo nuevo, mostrar botón para subir
             <Button onClick={handleUpload} disabled={isUploading || !userId} size="sm">
                {isUploading ? "Subiendo..." : "Subir Archivo"}
            </Button>
          ) : ( // Si es un archivo existente, mostrar botón para borrar
            <Button onClick={handleDelete} disabled={isDeleting} size="sm" variant="destructive">
              {isDeleting ? "Eliminando..." : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
