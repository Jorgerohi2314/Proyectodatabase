"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Download, Eye, ArrowUpDown } from "lucide-react"
import { UserProfile } from "@prisma/client"
import { calcularEdad } from "@/lib/utils/edad"
import { LoadingSpinner } from "./loading-spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ... (keep the rest of the imports)

// ... (keep UserCard component for now, it might be useful for a responsive view later or other parts of the app)

export function UserTable({ users, onEdit, onDelete, onView, onDownloadPDF, loading = false }: UserTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfile; direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' })

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users]
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
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
  
  const getSortIndicator = (key: keyof UserProfile) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-2 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  const tableScrollRef = useRef<HTMLDivElement>(null)
  const topScrollRef = useRef<HTMLDivElement>(null)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)
  const [hasOverflow, setHasOverflow] = useState(false)

  const syncScroll = (source: HTMLDivElement, target: HTMLDivElement | null) => {
    if (target) target.scrollLeft = source.scrollLeft
  }

  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const update = () => {
      setTableScrollWidth(el.scrollWidth)
      setHasOverflow(el.scrollWidth > el.clientWidth)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [users])

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
    <div className="w-full border rounded-lg overflow-hidden">
      {hasOverflow && (
        <div
          ref={topScrollRef}
          onScroll={(e) => syncScroll(e.currentTarget, tableScrollRef.current)}
          className="overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
          aria-hidden="true"
        >
          <div style={{ width: tableScrollWidth, height: 10 }} />
        </div>
      )}
      <Table
        scrollRef={tableScrollRef}
        onScroll={(e) => syncScroll(e.currentTarget, topScrollRef.current)}
      >
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('nombre')} className="cursor-pointer">
              <div className="flex items-center">Nombre {getSortIndicator('nombre')}</div>
            </TableHead>
            <TableHead onClick={() => requestSort('createdAt')} className="cursor-pointer">
              <div className="flex items-center">Fecha alta {getSortIndicator('createdAt')}</div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead onClick={() => requestSort('localidad')} className="cursor-pointer">
              <div className="flex items-center">Localidad {getSortIndicator('localidad')}</div>
            </TableHead>
            <TableHead onClick={() => requestSort('fechaNacimiento')} className="cursor-pointer">
              <div className="flex items-center">Edad {getSortIndicator('fechaNacimiento')}</div>
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <TableCell className="font-medium" onClick={() => onView(user)}>{user.nombre} {user.apellidos}</TableCell>
              <TableCell>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : <span className="text-gray-400">N/A</span>}
              </TableCell>
              <TableCell>
                {user.email ? (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-secondary dark:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {user.email}
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </TableCell>
              <TableCell>{user.telefono1 || <span className="text-gray-400">N/A</span>}</TableCell>
              <TableCell>{user.localidad || <span className="text-gray-400">N/A</span>}</TableCell>
              <TableCell>{calcularEdad(user.fechaNacimiento as unknown as Date)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onView(user)} className="h-8 w-8 p-0" title="Ver detalles">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="h-8 w-8 p-0" title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDownloadPDF(user.id)} className="h-8 w-8 p-0" title="Descargar PDF">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(user.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Eliminar">
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
