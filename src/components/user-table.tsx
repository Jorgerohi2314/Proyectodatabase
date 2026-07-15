"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Download, Eye, ArrowUpDown } from "lucide-react"
import { UserProfile } from "@prisma/client"
import { calcularEdad } from "@/lib/utils/edad"
import { LoadingSpinner } from "./loading-spinner"
import AnimatedList from "./animated-list" // Importamos el nuevo componente
import "./animated-list.css" // Importamos los estilos

interface UserTableProps {
  users: UserProfile[]
  onEdit: (user: UserProfile) => void
  onDelete: (id: string) => void
  onView: (user: UserProfile) => void
  onDownloadPDF: (id: string) => void
  loading?: boolean
}

// Componente para renderizar cada tarjeta de usuario
const UserCard = ({ 
  user, 
  onEdit, 
  onDelete, 
  onView, 
  onDownloadPDF 
}: { 
  user: UserProfile, 
  onEdit: (user: UserProfile) => void, 
  onDelete: (id: string) => void, 
  onView: (user: UserProfile) => void, 
  onDownloadPDF: (id: string) => void 
}) => {
  const gmailUrl = user.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}` : '#';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between w-full px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      
      {/* --- Grupo Izquierdo: Información Principal --- */}
      <div className="flex-grow cursor-pointer" onClick={() => onView(user)}>
        <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100">{user.nombre} {user.apellidos}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-x-2">
          {user.email ? (
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-base font-semibold text-secondary dark:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {user.email}
            </a>
          ) : (
            <span>Sin email</span>
          )}
          
          <span className="text-gray-300 dark:text-gray-600">·</span>
          
          <span>{user.telefono1 || 'Sin teléfono'}</span>
        </div>
      </div>

      {/* --- Grupo Derecho: Metadatos y Acciones --- */}
      <div className="flex items-center justify-between mt-2 md:mt-0 md:justify-end gap-x-4 flex-shrink-0">
        <div className="flex items-center gap-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{user.localidad || 'N/A'}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>{calcularEdad(user.fechaNacimiento as unknown as Date)} años</span>
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(user); }} className="h-8 w-8 p-0" title="Ver detalles">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(user); }} className="h-8 w-8 p-0" title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDownloadPDF(user.id); }} className="h-8 w-8 p-0" title="Descargar PDF">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(user.id); }} className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};


export function UserTable({ users, onEdit, onDelete, onView, onDownloadPDF, loading = false }: UserTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfile; direction: 'asc' | 'desc' } | null>({ key: 'nombre', direction: 'asc' })

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users]
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        // @ts-ignore
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        // @ts-ignore
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableUsers
  }, [users, sortConfig])

  const requestSort = (key: keyof UserProfile) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No hay usuarios</h3>
        <p className="text-gray-500 dark:text-gray-400">Crea un nuevo usuario para empezar.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
        <AnimatedList
            items={sortedUsers}
            onItemSelect={(item) => onView(item as UserProfile)}
            renderItem={(user) => (
              <UserCard 
                user={user as UserProfile}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                onDownloadPDF={onDownloadPDF}
              />
            )}
            itemKey="id"
        />
    </div>
  )
}
