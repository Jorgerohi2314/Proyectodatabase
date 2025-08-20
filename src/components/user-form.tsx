"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { UserProfile } from "@prisma/client"

const personalDataSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidos: z.string().min(1, "Los apellidos son requeridos"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  edad: z.number().min(1, "La edad es requerida"),
  nacionalidad: z.string().min(1, "La nacionalidad es requerida"),
  documentoIdentidad: z.string().min(1, "El documento de identidad es requerido"),
  sexo: z.enum(["HOMBRE", "MUJER"]),
  direccion: z.string().min(1, "La dirección es requerida"),
  localidad: z.string().min(1, "La localidad es requerida"),
  codigoPostal: z.string().optional(),
  telefono1: z.string().optional(),
  telefono2: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  carnetConducir: z.enum(["SI", "NO"]),
  vehiculoPropio: z.enum(["SI", "NO"]),
  tieneDiscapacidad: z.enum(["SI", "NO"]),
  porcentajeDiscapacidad: z.number().optional(),
  tipoDiscapacidad: z.string().optional(),
  entidadDerivacion: z.string().optional(),
  tecnicoDerivacion: z.string().optional(),
  colectivo: z.string().optional(),
})

const socioEconomicDataSchema = z.object({
  composicionFamiliar: z.string().min(1, "La composición familiar es requerida"),
  situacionEconomica: z.string().min(1, "La situación económica es requerida"),
  otrasCircunstancias: z.string().optional(),
})

const educationDataSchema = z.object({
  formacionAcademica: z.enum([
    "SIN_ESTUDIOS", "ESTUDIOS_PRIMARIOS", "CERTIFICADO_ESCOLARIDAD", "EGB", "ESO",
    "BACHILLER", "FPI_CICLO_GRADO_MEDIO", "FPII_CICLO_GRADO_SUPERIOR",
    "DIPLOMADO_ING_TECNICO", "LICENCIADO_ING_SUPERIOR", "OTROS"
  ]),
  anioFinalizacion: z.number().optional(),
  especificacionOtros: z.string().optional(),
  experienciaLaboralPrevia: z.string().optional(),
})

const courseSchema = z.object({
  nombreCurso: z.string().min(1, "El nombre del curso es requerido"),
  duracionHoras: z.number().min(1, "La duración es requerida"),
  entidad: z.string().min(1, "La entidad es requerida"),
  fechaRealizacion: z.string().min(1, "La fecha es requerida"),
})

const incomeMemberSchema = z.object({
  numero: z.number().min(1, "El número es requerido"),
  tipo: z.string().min(1, "El tipo es requerido"),
  cantidad: z.number().min(0, "La cantidad es requerida"),
})

const fullSchema = z.object({
  personalData: personalDataSchema,
  socioEconomicData: socioEconomicDataSchema,
  educationData: educationDataSchema,
  complementaryCourses: z.array(courseSchema),
  incomeMembers: z.array(incomeMemberSchema),
})

type FormData = z.infer<typeof fullSchema>

interface UserFormProps {
  user?: UserProfile
  onSave: (data: any) => void
  onCancel: () => void
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [complementaryCourses, setComplementaryCourses] = useState<any[]>([])
  const [incomeMembers, setIncomeMembers] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      personalData: {
        carnetConducir: "NO",
        vehiculoPropio: "NO",
        tieneDiscapacidad: "NO",
      },
      socioEconomicData: {
        composicionFamiliar: "",
        situacionEconomica: "",
      },
      educationData: {
        formacionAcademica: "SIN_ESTUDIOS",
      },
      complementaryCourses: [],
      incomeMembers: [],
    },
  })

  const tieneDiscapacidad = watch("personalData.tieneDiscapacidad")
  const formacionAcademica = watch("educationData.formacionAcademica")

  const onSubmit = (data: FormData) => {
    const completeData = {
      ...data.personalData,
      socioEconomicData: data.socioEconomicData,
      educationData: data.educationData,
      complementaryCourses,
      incomeMembers,
    }
    onSave(completeData)
  }

  const addCourse = () => {
    const newCourse = {
      id: Date.now().toString(),
      nombreCurso: "",
      duracionHoras: 0,
      entidad: "",
      fechaRealizacion: "",
    }
    setComplementaryCourses([...complementaryCourses, newCourse])
  }

  const removeCourse = (id: string) => {
    setComplementaryCourses(complementaryCourses.filter(course => course.id !== id))
  }

  const updateCourse = (id: string, field: string, value: any) => {
    setComplementaryCourses(
      complementaryCourses.map(course =>
        course.id === id ? { ...course, [field]: value } : course
      )
    )
  }

  const addIncomeMember = () => {
    const newMember = {
      id: Date.now().toString(),
      numero: 1,
      tipo: "",
      cantidad: 0,
    }
    setIncomeMembers([...incomeMembers, newMember])
  }

  const removeIncomeMember = (id: string) => {
    setIncomeMembers(incomeMembers.filter(member => member.id !== id))
  }

  const updateIncomeMember = (id: string, field: string, value: any) => {
    setIncomeMembers(
      incomeMembers.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Datos Personales</TabsTrigger>
            <TabsTrigger value="socio">Socio-Económicos</TabsTrigger>
            <TabsTrigger value="education">Formativos</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos Personales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      {...register("personalData.nombre")}
                    />
                    {errors.personalData?.nombre && (
                      <p className="text-sm text-red-600">{errors.personalData.nombre.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      {...register("personalData.apellidos")}
                    />
                    {errors.personalData?.apellidos && (
                      <p className="text-sm text-red-600">{errors.personalData.apellidos.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      {...register("personalData.fechaNacimiento")}
                    />
                    {errors.personalData?.fechaNacimiento && (
                      <p className="text-sm text-red-600">{errors.personalData.fechaNacimiento.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edad">Edad *</Label>
                    <Input
                      id="edad"
                      type="number"
                      {...register("personalData.edad", { valueAsNumber: true })}
                    />
                    {errors.personalData?.edad && (
                      <p className="text-sm text-red-600">{errors.personalData.edad.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nacionalidad">Nacionalidad *</Label>
                    <Input
                      id="nacionalidad"
                      {...register("personalData.nacionalidad")}
                    />
                    {errors.personalData?.nacionalidad && (
                      <p className="text-sm text-red-600">{errors.personalData.nacionalidad.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="documentoIdentidad">Documento de Identidad *</Label>
                    <Input
                      id="documentoIdentidad"
                      {...register("personalData.documentoIdentidad")}
                    />
                    {errors.personalData?.documentoIdentidad && (
                      <p className="text-sm text-red-600">{errors.personalData.documentoIdentidad.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="sexo">Sexo *</Label>
                    <Select onValueChange={(value) => setValue("personalData.sexo", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOMBRE">Hombre</SelectItem>
                        <SelectItem value="MUJER">Mujer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      {...register("personalData.direccion")}
                    />
                    {errors.personalData?.direccion && (
                      <p className="text-sm text-red-600">{errors.personalData.direccion.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="localidad">Localidad *</Label>
                    <Input
                      id="localidad"
                      {...register("personalData.localidad")}
                    />
                    {errors.personalData?.localidad && (
                      <p className="text-sm text-red-600">{errors.personalData.localidad.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="codigoPostal">Código Postal</Label>
                    <Input
                      id="codigoPostal"
                      {...register("personalData.codigoPostal")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono1">Teléfono 1</Label>
                    <Input
                      id="telefono1"
                      {...register("personalData.telefono1")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono2">Teléfono 2</Label>
                    <Input
                      id="telefono2"
                      {...register("personalData.telefono2")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("personalData.email")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carnetConducir">Carnet de Conducir</Label>
                    <Select onValueChange={(value) => setValue("personalData.carnetConducir", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">Sí</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vehiculoPropio">Vehículo Propio</Label>
                    <Select onValueChange={(value) => setValue("personalData.vehiculoPropio", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">Sí</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tieneDiscapacidad">¿Tiene Discapacidad?</Label>
                    <Select onValueChange={(value) => setValue("personalData.tieneDiscapacidad", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">Sí</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {tieneDiscapacidad === "SI" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="porcentajeDiscapacidad">Porcentaje de Discapacidad</Label>
                        <Input
                          id="porcentajeDiscapacidad"
                          type="number"
                          {...register("personalData.porcentajeDiscapacidad", { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipoDiscapacidad">Tipo de Discapacidad</Label>
                        <Input
                          id="tipoDiscapacidad"
                          {...register("personalData.tipoDiscapacidad")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="entidadDerivacion">Entidad de Derivación</Label>
                        <Input
                          id="entidadDerivacion"
                          {...register("personalData.entidadDerivacion")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tecnicoDerivacion">Técnico de Derivación</Label>
                        <Input
                          id="tecnicoDerivacion"
                          {...register("personalData.tecnicoDerivacion")}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="colectivo">Colectivo</Label>
                        <Input
                          id="colectivo"
                          {...register("personalData.colectivo")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="socio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos Socio-Familiares y Económicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="composicionFamiliar">1.- Composición Familiar *</Label>
                  <Textarea
                    id="composicionFamiliar"
                    rows={4}
                    {...register("socioEconomicData.composicionFamiliar")}
                  />
                  {errors.socioEconomicData?.composicionFamiliar && (
                    <p className="text-sm text-red-600">{errors.socioEconomicData.composicionFamiliar.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="situacionEconomica">2.- Situación Económica *</Label>
                  <Textarea
                    id="situacionEconomica"
                    rows={4}
                    {...register("socioEconomicData.situacionEconomica")}
                  />
                  {errors.socioEconomicData?.situacionEconomica && (
                    <p className="text-sm text-red-600">{errors.socioEconomicData.situacionEconomica.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Miembros Perceptores de Ingresos</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addIncomeMember}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Miembro
                    </Button>
                  </div>
                  {incomeMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                          <div>
                            <Label>Número</Label>
                            <Input
                              type="number"
                              value={member.numero}
                              onChange={(e) => updateIncomeMember(member.id, "numero", parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <Input
                              value={member.tipo}
                              onChange={(e) => updateIncomeMember(member.id, "tipo", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Cantidad</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={member.cantidad}
                              onChange={(e) => updateIncomeMember(member.id, "cantidad", parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIncomeMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="otrasCircunstancias">3.- Otras Situaciones y Circunstancias de Interés</Label>
                  <Textarea
                    id="otrasCircunstancias"
                    rows={4}
                    {...register("socioEconomicData.otrasCircunstancias")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos Formativos y Laborales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="formacionAcademica">Formación Académica *</Label>
                  <Select onValueChange={(value) => setValue("educationData.formacionAcademica", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
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

                {formacionAcademica === "OTROS" && (
                  <div>
                    <Label htmlFor="especificacionOtros">Especificación</Label>
                    <Input
                      id="especificacionOtros"
                      {...register("educationData.especificacionOtros")}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="anioFinalizacion">Año de Finalización</Label>
                  <Input
                    id="anioFinalizacion"
                    type="number"
                    {...register("educationData.anioFinalizacion", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="experienciaLaboralPrevia">Experiencia Laboral Previa</Label>
                  <Textarea
                    id="experienciaLaboralPrevia"
                    rows={4}
                    {...register("educationData.experienciaLaboralPrevia")}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Formación Complementaria</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCourse}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Curso
                    </Button>
                  </div>
                  {complementaryCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                          <div>
                            <Label>Nombre del Curso</Label>
                            <Input
                              value={course.nombreCurso}
                              onChange={(e) => updateCourse(course.id, "nombreCurso", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Duración (horas)</Label>
                            <Input
                              type="number"
                              value={course.duracionHoras}
                              onChange={(e) => updateCourse(course.id, "duracionHoras", parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>Entidad</Label>
                            <Input
                              value={course.entidad}
                              onChange={(e) => updateCourse(course.id, "entidad", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Fecha de Realización</Label>
                            <Input
                              type="date"
                              value={course.fechaRealizacion}
                              onChange={(e) => updateCourse(course.id, "fechaRealizacion", e.target.value)}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCourse(course.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {user ? "Actualizar Usuario" : "Crear Usuario"}
          </Button>
        </div>
      </form>
    </div>
  )
}