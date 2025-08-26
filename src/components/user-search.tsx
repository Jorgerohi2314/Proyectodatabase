"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface UserSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
}

export interface SearchFilters {
  nombre?: string
  apellidos?: string
  formacionAcademica?: string
}

export function UserSearch({ onSearch, onClear }: UserSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isClient, setIsClient] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stats, setStats] = useState<Array<{ sector: string; count: number }>>([])
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({})
    onClear()
  }

  const openInsercionStats = async () => {
    try {
      setLoadingStats(true)
      setIsDialogOpen(true)
      const res = await fetch('/api/users/insercion', { cache: 'no-store' })
      if (!res.ok) throw new Error('Error al cargar estadísticas')
      const data = await res.json()
      setStats(Array.isArray(data) ? data : [])
    } catch (e) {
      setStats([])
    } finally {
      setLoadingStats(false)
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== "")

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== "").length

  if (!isClient) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5" />
              Búsqueda de Usuarios
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Búsqueda de Usuarios
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre</label>
            <Input
              placeholder="Buscar por nombre..."
              value={filters.nombre || ""}
              onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Apellidos</label>
            <Input
              placeholder="Buscar por apellidos..."
              value={filters.apellidos || ""}
              onChange={(e) => setFilters({ ...filters, apellidos: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Formación Académica</label>
            <Select
              value={filters.formacionAcademica || "TODAS"}
              onValueChange={(value) => setFilters({ ...filters, formacionAcademica: value === "TODAS" ? "" : value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="SIN_ESTUDIOS">Sin Estudios</SelectItem>
                <SelectItem value="ESTUDIOS_PRIMARIOS">Estudios Primarios</SelectItem>
                <SelectItem value="CERTIFICADO_ESCOLARIDAD">Certificado de Escolaridad</SelectItem>
                <SelectItem value="EGB">E.G.B.</SelectItem>
                <SelectItem value="ESO">E.S.O.</SelectItem>
                <SelectItem value="BACHILLER">Bachiller</SelectItem>
                <SelectItem value="FPI_CICLO_GRADO_MEDIO">F.P.I/Ciclo Gº Medio</SelectItem>
                <SelectItem value="FPII_CICLO_GRADO_SUPERIOR">F.P.II/Ciclo Gº Superior</SelectItem>
                <SelectItem value="DIPLOMADO_ING_TECNICO">Diplomado/Ing. Técnico</SelectItem>
                <SelectItem value="LICENCIADO_ING_SUPERIOR">Licenciado/Ing. Superior</SelectItem>
                <SelectItem value="OTROS">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClear} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Limpiar ({activeFiltersCount})
            </Button>
          )}
          <Button variant="secondary" onClick={openInsercionStats} className="ml-auto">
            Inserciones por sector
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Inserciones por sector</DialogTitle>
            </DialogHeader>
            {loadingStats ? (
              <div className="py-8 text-center text-sm text-gray-500">Cargando...</div>
            ) : stats.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">Sin datos</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Insertados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((row) => (
                    <TableRow key={row.sector}>
                      <TableCell>{row.sector}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}