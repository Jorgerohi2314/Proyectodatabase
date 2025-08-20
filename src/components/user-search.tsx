"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"

interface UserSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
}

export interface SearchFilters {
  nombre?: string
  apellidos?: string
  localidad?: string
  tieneDiscapacidad?: string
  formacionAcademica?: string
  idiomas?: string
  informatica?: string
}

export function UserSearch({ onSearch, onClear }: UserSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({})
    onClear()
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== "")

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== "").length

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-600"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? "Ocultar" : "Avanzada"}
          </Button>
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
            <label className="text-sm font-medium text-gray-700 mb-1 block">Localidad</label>
            <Input
              placeholder="Buscar por localidad..."
              value={filters.localidad || ""}
              onChange={(e) => setFilters({ ...filters, localidad: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Discapacidad</label>
              <Select
                value={filters.tieneDiscapacidad || ""}
                onValueChange={(value) => setFilters({ ...filters, tieneDiscapacidad: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="SI">Sí</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Formación Académica</label>
              <Select
                value={filters.formacionAcademica || ""}
                onValueChange={(value) => setFilters({ ...filters, formacionAcademica: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
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
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Idiomas</label>
              <Input
                placeholder="Buscar por idiomas..."
                value={filters.idiomas || ""}
                onChange={(e) => setFilters({ ...filters, idiomas: e.target.value })}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Informática</label>
              <Input
                placeholder="Buscar por informática..."
                value={filters.informatica || ""}
                onChange={(e) => setFilters({ ...filters, informatica: e.target.value })}
                className="h-9"
              />
            </div>
          </div>
        )}

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
        </div>
      </CardContent>
    </Card>
  )
}