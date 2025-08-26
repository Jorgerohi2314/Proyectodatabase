"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { LogOut } from "lucide-react"
import Link from "next/link"

type UserRow = { id: string; nombre: string; apellidos: string; sector: string | null; empresa: string | null }

export default function StatsPage() {
  const [sector, setSector] = useState<string>("TODOS")
  const [loading, setLoading] = useState<boolean>(true)
  const [total, setTotal] = useState<number>(0)
  const [users, setUsers] = useState<UserRow[]>([])
  const [companies, setCompanies] = useState<Array<{ empresa: string; count: number }>>([])
  const { logout } = useAuth()

  const sectores = useMemo(() => [
    "TODOS", "Agricultura", "Hortofruticola", "Obra", "Ganaderia", "Servicios", "Industria", "Hosteleria", "Comercio", "Otro"
  ], [])

  const fetchStats = async (s: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (s && s !== 'TODOS') params.set('sector', s)
      const res = await fetch(`/api/stats/insercion?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setTotal(data.total || 0)
      setUsers(data.users || [])
      setCompanies(data.companies || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(sector)
  }, [sector])

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Estadísticas de Inserción</h1>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resumen</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Filtrar por sector</span>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectores.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Total insertados: {loading ? '...' : total}</div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios insertados {sector !== 'TODOS' ? `en ${sector}` : '(todos los sectores)'}</CardTitle>
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


