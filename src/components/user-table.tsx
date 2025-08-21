"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Download, Eye } from "lucide-react"
import { UserProfile } from "@prisma/client"
import { calcularEdad } from "@/lib/utils/edad"
import { LoadingSpinner } from "./loading-spinner"

interface UserTableProps {
  users: UserProfile[]
  onEdit: (user: UserProfile) => void
  onDelete: (id: string) => void
  onView: (user: UserProfile) => void
  onDownloadPDF: (id: string) => void
  loading?: boolean
}

export function UserTable({ users, onEdit, onDelete, onView, onDownloadPDF, loading = false }: UserTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
        <p className="text-gray-500">No se encontraron usuarios en el sistema.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellidos</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Localidad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Discapacidad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{user.nombre}</TableCell>
              <TableCell>{user.apellidos}</TableCell>
              <TableCell>{calcularEdad(user.fechaNacimiento as unknown as Date)}</TableCell>
              <TableCell>{user.localidad}</TableCell>
              <TableCell>{user.telefono1 || "-"}</TableCell>
              <TableCell>{user.email || "-"}</TableCell>
              <TableCell>
                {user.tieneDiscapacidad === "SI" ? (
                  <Badge variant="destructive">
                    {user.porcentajeDiscapacidad || "Sí"}%
                  </Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(user)}
                    className="h-8 w-8 p-0"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                    className="h-8 w-8 p-0"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadPDF(user.id)}
                    className="h-8 w-8 p-0"
                    title="Descargar PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}