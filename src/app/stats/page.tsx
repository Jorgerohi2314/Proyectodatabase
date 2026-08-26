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
import { LogOut, Users, Globe, MapPin, Building2, Filter, Clock } from "lucide-react"
import Link from "next/link"
import { getLaboralYear, sortLaboralYears } from "@/lib/utils/laboral-year"

type UserRow = { id: string; nombre: string; apellidos: string; sector: string | null; empresa: string | null }
type StatRow = { label: string | null; count: number }
type HorasUser = { id: string; nombre: string; apellidos: string; totalHoras: number }
type HorasStats = {
  umbralHoras: number
  counts: { menosDe4: number; cuatroOMas: number; sinRegistros: number }
  menosDe4: HorasUser[]
  cuatroOMas: HorasUser[]
}

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
  const [horasStats, setHorasStats] = useState<HorasStats | null>(null)
  const [sectorInsercionStats, setSectorInsercionStats] = useState<StatRow[]>([])
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
      const humanize = (v: string | null | undefined) =>
        v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase().replace(/_/g, ' ') : null
      setTotal(data.total || 0)
      setUsers(data.users || [])
      setCompanies(data.companies || [])
      setSexoStats((data.sexo || []).map((s: { sexo: string | null; count: number }) => ({ label: humanize(s.sexo), count: s.count })))
      setNacionalidadStats((data.nacionalidad || []).map((n: { nacionalidad: string | null; count: number }) => ({ label: humanize(n.nacionalidad), count: n.count })))
      setLocalidadStats((data.localidad || []).map((l: { localidad: string | null; count: number }) => ({ label: humanize(l.localidad), count: l.count })))
      setLocalidadInsercionStats((data.localidadInsercion || []).map((l: { localidadInsercion: string | null; count: number }) => ({ label: humanize(l.localidadInsercion), count: l.count })))

      const resHoras = await fetch(`/api/stats/horas?${params.toString()}`, { cache: 'no-store' })
      const dataHoras = await resHoras.json()
      setHorasStats(dataHoras)
      setSectorInsercionStats((data.sectorInsercion || []).map((s: { sector: string | null; count: number }) => ({ label: humanize(s.sector), count: s.count })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [sector, laboralYear, onlyInserted])

  const formatLabel = (label: string | null | undefined) => label ?? 'Sin especificar'

  const formatDuracion = (horas: number) => {
    const h = Math.floor(horas)
    const m = Math.round((horas - h) * 60)
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} h`
    return `${h} h ${m} min`
  }

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

          {/* Sector de Inserción */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-teal-600" />
                Sector de Inserción
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-center text-sm text-gray-500">Cargando...</div>
              ) : sectorInsercionStats.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">Sin datos</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Inserciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectorInsercionStats.map((s) => (
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
        </div>

        {/* Estadísticas por horas dedicadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-indigo-600" />
              Horas Dedicadas {horasStats ? `(umbral: ${horasStats.umbralHoras} h)` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!horasStats ? (
              <div className="py-4 text-center text-sm text-gray-500">Cargando...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-600">{horasStats.counts.menosDe4}</p>
                    <p className="text-sm text-gray-600">Menos de {horasStats.umbralHoras} horas</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{horasStats.counts.cuatroOMas}</p>
                    <p className="text-sm text-gray-600">{horasStats.umbralHoras} o más horas</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-gray-500">{horasStats.counts.sinRegistros}</p>
                    <p className="text-sm text-gray-600">Sin registros de horas</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Menos de {horasStats.umbralHoras} horas</h4>
                    {horasStats.menosDe4.length === 0 ? (
                      <p className="text-sm text-gray-500">Ningún usuario</p>
                    ) : (
                      <ul className="space-y-1">
                        {horasStats.menosDe4.map((u) => (
                          <li key={u.id} className="flex justify-between text-sm bg-gray-50 px-3 py-1.5 rounded">
                            <span>{u.nombre} {u.apellidos}</span>
                            <span className="font-medium">{formatDuracion(u.totalHoras)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{horasStats.umbralHoras} o más horas</h4>
                    {horasStats.cuatroOMas.length === 0 ? (
                      <p className="text-sm text-gray-500">Ningún usuario</p>
                    ) : (
                      <ul className="space-y-1">
                        {horasStats.cuatroOMas.map((u) => (
                          <li key={u.id} className="flex justify-between text-sm bg-green-50 px-3 py-1.5 rounded">
                            <span>{u.nombre} {u.apellidos}</span>
                            <span className="font-medium">{formatDuracion(u.totalHoras)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

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
