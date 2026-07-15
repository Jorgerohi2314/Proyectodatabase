"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { X, User, Users, GraduationCap, FileText, Phone, Mail, MapPin, Calendar, CreditCard, Car, Accessibility, BookText } from "lucide-react"
import { calcularEdad } from "@/lib/utils/edad"

interface DiaryEntry {
  id: string;
  createdAt: string;
  content: string;
}

interface UserDetailViewProps {
  user: any
  onClose: () => void
}

export function UserDetailView({ user, onClose }: UserDetailViewProps) {
  const { toast } = useToast();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [newEntryContent, setNewEntryContent] = useState("");
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  useEffect(() => {
    async function fetchDiaryEntries() {
      if (!user?.id) return;
      setIsLoadingEntries(true);
      try {
        const response = await fetch(`/api/users/${user.id}/diary`);
        if (!response.ok) {
          throw new Error("No se pudieron cargar las entradas del diario.");
        }
        const entries = await response.json();
        setDiaryEntries(entries);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } finally {
        setIsLoadingEntries(false);
      }
    }
    fetchDiaryEntries();
  }, [user?.id, toast]);

  const handleSaveNewEntry = async () => {
    if (!newEntryContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La entrada del diario no puede estar vacía.",
      });
      return;
    }
    setIsSavingEntry(true);
    try {
      const response = await fetch(`/api/users/${user.id}/diary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newEntryContent }),
      });
      if (!response.ok) {
        throw new Error("No se pudo guardar la entrada.");
      }
      const newEntry = await response.json();
      setDiaryEntries([newEntry, ...diaryEntries]);
      setNewEntryContent("");
      toast({
        title: "Éxito",
        description: "Nueva entrada del diario guardada.",
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message,
      });
    } finally {
      setIsSavingEntry(false);
    }
  };
  
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
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="diary" className="flex items-center gap-2">
            <BookText className="h-4 w-4" />
            Diario
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

              {user.curriculum && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Currículum</p>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <a href={user.curriculum} target="_blank" rel="noopener noreferrer">
                          Descargar Currículum
                        </a>
                      </Button>
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
        <TabsContent value="diary">
          <Card>
            <CardHeader>
              <CardTitle>Diario de Seguimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Textarea
                  placeholder="Escribe una nueva entrada en el diario..."
                  rows={4}
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                />
                 <Button onClick={handleSaveNewEntry} disabled={isSavingEntry}>
                  {isSavingEntry ? "Guardando..." : "Guardar Entrada"}
                </Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold">Historial de Entradas</h4>
                {isLoadingEntries ? (
                  <p>Cargando diario...</p>
                ) : diaryEntries.length > 0 ? (
                  <ul className="space-y-4">
                    {diaryEntries.map((entry) => (
                      <li key={entry.id} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">{formatFecha(entry.createdAt)}</p>
                        <p className="mt-1 whitespace-pre-wrap">{entry.content}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay entradas en el diario.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
