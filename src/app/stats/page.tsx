"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, Users, Globe, MapPin, Building2, Filter } from "lucide-react"
import Link from "next/link"
import { getLaboralYear, sortLaboralYears } from "@/lib/utils/laboral-year"

type UserRow = { id: string; nombre: string; apellidos: string; sector: string | null; empresa: string | null }
type StatRow = { label: string; count: number }

export default function StatsPage() {
  const [sector, setSector] = useState<string>("TODOS")
  const [laboralYear, setLaboralYear] = useState<string | null>(null)
  const [onlyInserted, setOnlyInserted] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [total, setTotal] = useState<number>(0)
  const [users, setUsers] = useState<UserRow[]>([])
  const [companies, setCompanies] = useState<Array<{ empresa: string; count: number }>>([])
  const [sexoStats, setSexoStats] = useState<StatRow[]>([])
  const [nacionalidadStats, setNacionalidadStats] = useState<StatRow[]>([])
  const [localidadStats, setLocalidadStats] = useState<StatRow[]>([])
  const [localidadInsercionStats, setLocalidadInsercionStats] = useState<StatRow[]>([])
  const { logout } = useAuth()

  const sectores = useMemo(() => [
    "TODOS", "Agricultura", "Hortofruticola", "Obra", "Ganaderia", "Servicios", "Industria", "Hosteleria", "Comercio", "Otro"
  ], [])

  const laboralYears = useMemo(() => {
    // Generate laboral years from 2020 to current
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let y = 2020; y <= currentYear + 1; y++) {
      const startShort = String(y).slice(-2)
      const endShort = String(y + 1).slice(-2)
      years.push(`${startShort}/${endShort}`)
    }
    return sortLaboralYears(years)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (sector && sector !== 'TODOS') params.set('sector', sector)
      if (laboralYear) params.set('laboralYear', laboralYear)
      if (onlyInserted) params.set('onlyInserted', 'true')
      
      const res = await fetch(`/api/stats/insercion?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setTotal(data.total || 0)
      setUsers(data.users || [])
      setCompanies(data.companies || [])
      setSexoStats(data.sexo || [])
      setNacionalidadStats(data.nacionalidad || [])
      setLocalidadStats(data.localidad || [])
      setLocalidadInsercionStats(data.localidadInsercion || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [sector, laboralYear, onlyInserted])

  const formatLabel = (label: string | null | undefined) => label ?? 'Sin especificar'

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Estadísticas</h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">Volver</Link>
            </Button>
            <Button onClick={logout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Año Laboral</Label>
                <Select value={laboralYear ?? "TODOS"} onValueChange={(v) => setLaboralYear(v === "TODOS" ? null : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los años" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos los años</SelectItem>
                    {laboralYears.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Sector</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectores.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInserted}
                    onChange={(e) => setOnlyInserted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Solo usuarios insertados</span>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Resumen General</span>
              </div>
              <div className="text-2xl font-semibold text-blue-600">
                Total: {loading ? '...' : total}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Estadísticas en grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sexo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                Por Sexo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center text-sm text-gray-500">Cargando...</div>
              ) : sexoStats.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">Sin datos</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sexo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sexoStats.map((s) => (
                      <TableRow key={s.label}>
                        <TableCell>{formatLabel(s.label)}</TableCell>
                        <TableCell className="text-right font-medium">{s.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Nacionalidad */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-green-600" />
                Por Nacionalidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center text-sm text-gray-500">Cargando...</div>
              ) : nacionalidadStats.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">Sin datos</div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nacionalidad</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nacionalidadStats.slice(0, 10).map((n) => (
                        <TableRow key={n.label}>
                          <TableCell>{formatLabel(n.label)}</TableCell>
                          <TableCell className="text-right font-medium">{n.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localidad */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-orange-600" />
                Por Localidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center text-sm text-gray-500">Cargando...</div>
              ) : localidadStats.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">Sin datos</div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Localidad</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localidadStats.slice(0, 10).map((l) => (
                        <TableRow key={l.label}>
                          <TableCell>{formatLabel(l.label)}</TableCell>
                          <TableCell className="text-right font-medium">{l.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localidad de Inserción */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
                Localidad Inserción
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center text-sm text-gray-500">Cargando...</div>
              ) : localidadInsercionStats.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">Sin datos</div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Localidad</TableHead>
                        <TableHead className="text-right">Inserciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localidadInsercionStats.map((l) => (
                        <TableRow key={l.label}>
                          <TableCell>{formatLabel(l.label)}</TableCell>
                          <TableCell className="text-right font-medium">{l.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalle de usuarios y empresas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios {onlyInserted ? 'insertados' : ''} {sector !== 'TODOS' ? `en ${sector}` : ''} {laboralYear ? `(${laboralYear})` : ''}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">Cargando...</div>
              ) : users.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">Sin resultados</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellidos</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.nombre}</TableCell>
                        <TableCell>{u.apellidos}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{u.sector ?? 'Sin especificar'}</Badge>
                        </TableCell>
                        <TableCell>{u.empresa ?? 'Sin especificar'}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/?view=${u.id}`}>Ver</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de empresas por inserciones</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">Cargando...</div>
              ) : companies.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">Sin resultados</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="text-right">Inserciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((c) => (
                      <TableRow key={c.empresa}>
                        <TableCell>{c.empresa}</TableCell>
                        <TableCell className="text-right">{c.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
