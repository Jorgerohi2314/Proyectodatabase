"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, User, Users, GraduationCap, FileText, Phone, Mail, MapPin, Calendar, CreditCard, Car, Accessibility } from "lucide-react"
import { calcularEdad } from "@/lib/utils/edad"

interface UserDetailViewProps {
  user: any
  onClose: () => void
}

export function UserDetailView({ user, onClose }: UserDetailViewProps) {
  const formatFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.nombre} {user.apellidos}
            </h2>
            <p className="text-gray-600">Detalles completos del usuario</p>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Cerrar
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Datos Personales
          </TabsTrigger>
          <TabsTrigger value="socio" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Socio-Económicos
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Formativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                    <p className="font-medium">{formatFecha(user.fechaNacimiento)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 text-gray-500">🎂</span>
                  <div>
                    <p className="text-sm text-gray-600">Edad</p>
                    <p className="font-medium">{calcularEdad(user.fechaNacimiento)} años</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 text-gray-500">🌍</span>
                  <div>
                    <p className="text-sm text-gray-600">Nacionalidad</p>
                    <p className="font-medium">{user.nacionalidad}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Documento de Identidad</p>
                    <p className="font-medium">{user.documentoIdentidad}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 text-gray-500">👤</span>
                  <div>
                    <p className="text-sm text-gray-600">Sexo</p>
                    <p className="font-medium">{user.sexo === 'HOMBRE' ? 'Hombre' : 'Mujer'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Localidad</p>
                    <p className="font-medium">{user.localidad}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Dirección</p>
                <p className="font-medium">{user.direccion}</p>
                {user.codigoPostal && (
                  <p className="text-sm text-gray-600">C.P. {user.codigoPostal}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono 1</p>
                    <p className="font-medium">{user.telefono1 || 'No disponible'}</p>
                  </div>
                </div>
                {user.telefono2 && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono 2</p>
                      <p className="font-medium">{user.telefono2}</p>
                    </div>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Carnet de Conducir</p>
                    <Badge variant={user.carnetConducir === 'SI' ? 'default' : 'secondary'}>
                      {user.carnetConducir === 'SI' ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Vehículo Propio</p>
                    <Badge variant={user.vehiculoPropio === 'SI' ? 'default' : 'secondary'}>
                      {user.vehiculoPropio === 'SI' ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {user.tieneDiscapacidad === 'SI' && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Accessibility className="h-4 w-4" />
                      Información de Discapacidad
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.porcentajeDiscapacidad && (
                        <div>
                          <p className="text-sm text-gray-600">Porcentaje</p>
                          <Badge variant="destructive">{user.porcentajeDiscapacidad}%</Badge>
                        </div>
                      )}
                      {user.tipoDiscapacidad && (
                        <div>
                          <p className="text-sm text-gray-600">Tipo</p>
                          <p className="font-medium">{user.tipoDiscapacidad}</p>
                        </div>
                      )}
                      {user.entidadDerivacion && (
                        <div>
                          <p className="text-sm text-gray-600">Entidad de Derivación</p>
                          <p className="font-medium">{user.entidadDerivacion}</p>
                        </div>
                      )}
                      {user.tecnicoDerivacion && (
                        <div>
                          <p className="text-sm text-gray-600">Técnico de Derivación</p>
                          <p className="font-medium">{user.tecnicoDerivacion}</p>
                        </div>
                      )}
                      {user.colectivo && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Colectivo</p>
                          <p className="font-medium">{user.colectivo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="socio" className="space-y-4">
          {user.socioEconomicData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Datos Socio-Familiares y Económicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">1. Composición Familiar</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{user.socioEconomicData.composicionFamiliar}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Situación Económica</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{user.socioEconomicData.situacionEconomica}</p>
                  </div>
                </div>

                {user.incomeMembers && user.incomeMembers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Miembros Perceptores de Ingresos</h4>
                    <div className="space-y-3">
                      {user.incomeMembers.map((member: any, index: number) => (
                        <div key={member.id} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Número</p>
                              <p className="font-medium">{member.numero}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Tipo</p>
                              <p className="font-medium">{member.tipo}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Cantidad</p>
                              <p className="font-medium">€{member.cantidad.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {user.socioEconomicData.otrasCircunstancias && (
                  <div>
                    <h4 className="font-semibold mb-2">3. Otras Situaciones y Circunstancias de Interés</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{user.socioEconomicData.otrasCircunstancias}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay datos socio-económicos registrados</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          {user.educationData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Formación Académica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nivel de Formación</p>
                      <Badge variant="outline" className="text-sm">
                        {user.educationData.formacionAcademica.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {user.educationData.anioFinalizacion && (
                      <div>
                        <p className="text-sm text-gray-600">Año de Finalización</p>
                        <p className="font-medium">{user.educationData.anioFinalizacion}</p>
                      </div>
                    )}
                  </div>
                  
                  {user.educationData.especificacionOtros && (
                    <div>
                      <p className="text-sm text-gray-600">Especificación</p>
                      <p className="font-medium">{user.educationData.especificacionOtros}</p>
                    </div>
                  )}

                  {user.educationData.experienciaLaboralPrevia && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Experiencia Laboral Previa</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{user.educationData.experienciaLaboralPrevia}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {user.complementaryCourses && user.complementaryCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Formación Complementaria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.complementaryCourses.map((course: any) => (
                        <div key={course.id} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Curso</p>
                              <p className="font-medium">{course.nombreCurso}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Duración</p>
                              <p className="font-medium">{course.duracionHoras} horas</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Entidad</p>
                              <p className="font-medium">{course.entidad}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Fecha de Realización</p>
                              <p className="font-medium">{formatFecha(course.fechaRealizacion)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay datos formativos registrados</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}