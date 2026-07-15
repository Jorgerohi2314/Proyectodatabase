"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, SubmitHandler, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import { UserProfile } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { CurriculumUploader } from "./curriculum-uploader"
import Stepper, { Step } from "./stepper"

const personalDataSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
  source: z.enum(["PROPIO", "DERIVADO"]).default("PROPIO"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  nacionalidad: z.string().min(1, "La nacionalidad es obligatoria"),
  documentoIdentidad: z.string().min(1, "El documento de identidad es obligatorio"),
  numeroSeguridadSocial: z.string().optional(),
  sexo: z.enum(["HOMBRE", "MUJER"], { required_error: "El sexo es obligatorio" }).default("HOMBRE"),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  localidad: z.string().min(1, "La localidad es obligatoria"),
  codigoPostal: z.string().optional(),
  telefono1: z.string().optional(),
  telefono2: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("El formato del email no es válido")]),
  carnetConducir: z.enum(["SI", "NO"]).default("NO"),
  vehiculoPropio: z.enum(["SI", "NO"]).default("NO"),
  tieneDiscapacidad: z.enum(["SI", "NO"]).default("NO"),
  porcentajeDiscapacidad: z.number({ invalid_type_error: "El porcentaje debe ser un número" }).nullable().optional(),
  tipoDiscapacidad: z.string().optional(),
  entidadDerivacion: z.string().optional(),
  tecnicoDerivacion: z.string().optional(),
  colectivo: z.string().optional(),
  curriculum: z.string().url().optional().nullable(),
})

const socioEconomicDataSchema = z.object({
  composicionFamiliar: z.string().optional(),
  situacionEconomica: z.string().optional(),
  otrasCircunstancias: z.string().optional(),
}).optional()

const educationDataSchema = z.object({
  formacionAcademica: z.enum([
    "SIN_ESTUDIOS", "ESTUDIOS_PRIMARIOS", "CERTIFICADO_ESCOLARIDAD", "EGB", "ESO",
    "BACHILLER", "FPI_CICLO_GRADO_MEDIO", "FPII_CICLO_GRADO_SUPERIOR",
    "DIPLOMADO_ING_TECNICO", "LICENCIADO_ING_SUPERIOR", "OTROS"
  ]).default("SIN_ESTUDIOS"),
  anioFinalizacion: z.number({ invalid_type_error: "El año debe ser un número" }).nullable().optional(),
  especificacionOtros: z.string().optional(),
  experienciaLaboralPrevia: z.string().optional(),
})

const insercionSchema = z.object({
  insertado: z.enum(["SI", "NO"]).default("NO"),
  sector: z.string().optional(),
  empresa: z.string().optional(),
})

const courseSchema = z.object({
  id: z.string().optional(),
  nombreCurso: z.string().min(1, "El nombre del curso es obligatorio"),
  duracionHoras: z.number({ invalid_type_error: "La duración debe ser un número" }).min(1, "La duración es obligatoria"),
  entidad: z.string().min(1, "La entidad es obligatoria"),
  fechaRealizacion: z.string().min(1, "La fecha es obligatoria"),
})

const incomeMemberSchema = z.object({
  id: z.string().optional(),
  numero: z.number({ invalid_type_error: "El número debe ser un valor numérico" }).min(1, "El número es obligatorio"),
  tipo: z.string().min(1, "El tipo es obligatorio"),
  cantidad: z.number({ invalid_type_error: "La cantidad debe ser un valor numérico" }).min(0, "La cantidad es obligatoria"),
})

const fullSchema = z.object({
  personalData: personalDataSchema,
  socioEconomicData: socioEconomicDataSchema,
  educationData: educationDataSchema,
  insercion: insercionSchema,
  complementaryCourses: z.array(courseSchema),
  incomeMembers: z.array(incomeMemberSchema),
})

type FormData = z.infer<typeof fullSchema>

interface UserWithOptionalRelations extends UserProfile {
  socioEconomicData?: { composicionFamiliar?: string; situacionEconomica?: string; otrasCircunstancias?: string } | null
  educationData?: { formacionAcademica?: any; anioFinalizacion?: number | null; especificacionOtros?: string | null; experienciaLaboralPrevia?: string | null } | null
  complementaryCourses?: any[]
  incomeMembers?: any[]
}

interface UserFormProps {
  user?: UserWithOptionalRelations
  onSave: (data: any, curriculumFile?: File | null) => void
  onCancel: () => void
  isSaving?: boolean
}

export function UserForm({ user, onSave, onCancel, isSaving = false }: UserFormProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema) as any,
    shouldUnregister: false,
    defaultValues: {
      personalData: {
        sexo: "HOMBRE",
        carnetConducir: "NO",
        vehiculoPropio: "NO",
        tieneDiscapacidad: "NO",
        source: "PROPIO",
      },
      socioEconomicData: undefined,
      educationData: {
        formacionAcademica: "SIN_ESTUDIOS",
        anioFinalizacion: undefined,
        especificacionOtros: "",
        experienciaLaboralPrevia: "",
      },
      insercion: { insertado: "NO", sector: undefined, empresa: "" },
      complementaryCourses: [],
      incomeMembers: [],
    },
  })

  const { 
    fields: courseFields, 
    append: appendCourse, 
    remove: removeCourse 
  } = useFieldArray({
    control,
    name: "complementaryCourses",
  });

  const { 
    fields: incomeMemberFields, 
    append: appendIncomeMember, 
    remove: removeIncomeMember 
  } = useFieldArray({
    control,
    name: "incomeMembers",
  });

  const normalizeYesNo = (val: any): "SI" | "NO" => (val === true || val === "true" || val === 1 || String(val).toUpperCase() === "SI") ? "SI" : "NO"
  const normalizeGender = (val: any): "HOMBRE" | "MUJER" => String(val).toUpperCase() === "MUJER" ? "MUJER" : "HOMBRE"

  useEffect(() => {
    if (user) {
      // FIX: Si el curriculum es una ruta relativa, conviértelo en absoluta.
      const curriculumUrl = user.curriculum && !user.curriculum.startsWith('http')
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${user.curriculum}`
        : user.curriculum;

      reset({
        personalData: {
          nombre: user.nombre || "",
          apellidos: user.apellidos || "",
          source: user.source || "PROPIO",
          fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento).toISOString().split('T')[0] : "",
          nacionalidad: user.nacionalidad || "",
          documentoIdentidad: user.documentoIdentidad || "",
          numeroSeguridadSocial: (user as any).numeroSeguridadSocial || "",
          sexo: normalizeGender(user.sexo),
          direccion: user.direccion || "",
          localidad: user.localidad || "",
          codigoPostal: user.codigoPostal || "",
          telefono1: user.telefono1 || "",
          telefono2: user.telefono2 || "",
          email: user.email || "",
          carnetConducir: normalizeYesNo(user.carnetConducir) as any,
          vehiculoPropio: normalizeYesNo(user.vehiculoPropio) as any,
          tieneDiscapacidad: normalizeYesNo(user.tieneDiscapacidad) as any,
          porcentajeDiscapacidad: user.porcentajeDiscapacidad ?? undefined,
          tipoDiscapacidad: user.tipoDiscapacidad || "",
          entidadDerivacion: user.entidadDerivacion || "",
          tecnicoDerivacion: user.tecnicoDerivacion || "",
          colectivo: user.colectivo || "",
          curriculum: curriculumUrl || null,
        },
        socioEconomicData: user.socioEconomicData
          ? {
              composicionFamiliar: user.socioEconomicData.composicionFamiliar || "",
              situacionEconomica: user.socioEconomicData.situacionEconomica || "",
              otrasCircunstancias: user.socioEconomicData.otrasCircunstancias || "",
            }
          : undefined,
        educationData: user.educationData
          ? {
              formacionAcademica: (user.educationData.formacionAcademica as any) ?? "SIN_ESTUDIOS",
              anioFinalizacion: user.educationData.anioFinalizacion ?? undefined,
              especificacionOtros: user.educationData.especificacionOtros || "",
              experienciaLaboralPrevia: user.educationData.experienciaLaboralPrevia || "",
            }
          : { formacionAcademica: "SIN_ESTUDIOS" },
        insercion: {
          insertado: ((user as any).insertado as "SI" | "NO") || "NO",
          sector: (user as any).sector ?? undefined,
          empresa: (user as any).empresa || "",
        },
        complementaryCourses: (user.complementaryCourses || []).map((c: any) => ({
          nombreCurso: c.nombreCurso || "",
          duracionHoras: c.duracionHoras ?? undefined,
          entidad: c.entidad || "",
          fechaRealizacion: c.fechaRealizacion ? new Date(c.fechaRealizacion).toISOString().split('T')[0] : "",
        })),
        incomeMembers: (user.incomeMembers || []).map((m: any) => ({
          numero: m.numero ?? undefined,
          tipo: m.tipo || "",
          cantidad: m.cantidad ?? undefined,
        })),
      })
    }
  }, [user, reset])

  const tieneDiscapacidad = watch("personalData.tieneDiscapacidad")
  const formacionAcademica = watch("educationData.formacionAcademica") as any
  const insertado = watch("insercion.insertado")

  const mostrarEspecificacion = () => ["FPI_CICLO_GRADO_MEDIO", "FPII_CICLO_GRADO_SUPERIOR", "DIPLOMADO_ING_TECNICO", "LICENCIADO_ING_SUPERIOR", "OTROS"].includes(formacionAcademica)
  const getLabelEspecificacion = () => ({
    "FPI_CICLO_GRADO_MEDIO": "Especificar Ciclo de Grado Medio",
    "FPII_CICLO_GRADO_SUPERIOR": "Especificar Ciclo de Grado Superior",
    "DIPLOMADO_ING_TECNICO": "Especificar Diplomado/Ingeniería Técnica",
    "LICENCIADO_ING_SUPERIOR": "Especificar Licenciatura/Ingeniería Superior",
    "OTROS": "Especificación"
  }[formacionAcademica] || "Especificación")

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const completeData = {
      ...data.personalData,
      socioEconomicData: data.socioEconomicData,
      educationData: data.educationData,
      insertado: data.insercion.insertado,
      sector: data.insercion.insertado === "SI" ? data.insercion.sector : undefined,
      empresa: data.insercion.insertado === "SI" ? data.insercion.empresa : undefined,
      complementaryCourses: data.complementaryCourses,
      incomeMembers: data.incomeMembers,
    }
    onSave(completeData, curriculumFile)
  }

  const onError = (errors: any) => {
    console.error("Errores de validación del formulario:", errors)
    
    let errorMessages = "Por favor, revisa los siguientes campos: ";
    const fields = new Set<string>();

    const findErrorFields = (obj: any, prefix = '') => {
      for (const key in obj) {
        if (obj[key]?.message) {
          fields.add(prefix + key);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          findErrorFields(obj[key], `${prefix}${key}.`);
        }
      }
    };

    findErrorFields(errors);
    errorMessages += Array.from(fields).join(', ');

    toast({
      variant: "destructive",
      title: "Error de Validación",
      description: fields.size > 0 ? errorMessages : "Hay errores o faltan datos obligatorios.",
      duration: 9000,
    })

    // Navegar al primer paso con error
    if (errors.personalData) {
      setCurrentStep(1);
    } else if (errors.socioEconomicData || errors.incomeMembers) {
      setCurrentStep(2);
    } else if (errors.educationData || errors.complementaryCourses) {
      setCurrentStep(3);
    } else if (errors.insercion) {
      setCurrentStep(4);
    }
  }

  const handleCurriculumUploadComplete = (url: string) => {
    setValue("personalData.curriculum", url, { shouldValidate: true, shouldDirty: true })
    setCurriculumFile(null)
  }

  const handleCurriculumDeleteComplete = () => {
    setValue("personalData.curriculum", null, { shouldValidate: true, shouldDirty: true })
  }

  const curriculumUrl = watch("personalData.curriculum")


  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 px-6 pb-6">
          <Stepper
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onFinalStepCompleted={() => handleSubmit(onSubmit, onError)()}
            backButtonText="Anterior"
            nextButtonText="Siguiente"
            className="flex-1 flex flex-col"
          >
            <Step>
                <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-semibold">Datos Personales</h3>
                    <p className="text-sm text-gray-500">Información básica y de contacto del usuario.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                  {/* Fila 1 */}
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" {...register("personalData.nombre")} />
                    {errors.personalData?.nombre && <p className="text-red-500 text-xs">{errors.personalData.nombre.message}</p>}
                  </div>
                  <div className="lg:col-span-2">
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input id="apellidos" {...register("personalData.apellidos")} />
                    {errors.personalData?.apellidos && <p className="text-red-500 text-xs">{errors.personalData.apellidos.message}</p>}
                  </div>
                  <div>
                    <Label>Fuente</Label>
                    <Controller
                      name="personalData.source"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROPIO">Propio</SelectItem>
                            <SelectItem value="DERIVADO">Derivado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.personalData?.source && <p className="text-red-500 text-xs">{errors.personalData.source.message}</p>}
                  </div>
                   <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("personalData.email")} />
                    {errors.personalData?.email && <p className="text-red-500 text-xs">{errors.personalData.email.message}</p>}
                  </div>

                  {/* Fila 2 */}
                  <div>
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input id="fechaNacimiento" type="date" {...register("personalData.fechaNacimiento")} />
                    {errors.personalData?.fechaNacimiento && <p className="text-red-500 text-xs">{errors.personalData.fechaNacimiento.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="documentoIdentidad">Documento de Identidad</Label>
                    <Input id="documentoIdentidad" {...register("personalData.documentoIdentidad")} />
                    {errors.personalData?.documentoIdentidad && <p className="text-red-500 text-xs">{errors.personalData.documentoIdentidad.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="nacionalidad">Nacionalidad</Label>
                    <Input id="nacionalidad" {...register("personalData.nacionalidad")} />
                    {errors.personalData?.nacionalidad && <p className="text-red-500 text-xs">{errors.personalData.nacionalidad.message}</p>}
                  </div>
                  <div>
                    <Label>Sexo</Label>
                    <Controller
                      name="personalData.sexo"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HOMBRE">Hombre</SelectItem>
                            <SelectItem value="MUJER">Mujer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.personalData?.sexo && <p className="text-red-500 text-xs">{errors.personalData.sexo.message}</p>}
                  </div>

                  {/* Fila 3 */}
                   <div className="lg:col-span-4">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" {...register("personalData.direccion")} />
                    {errors.personalData?.direccion && <p className="text-red-500 text-xs">{errors.personalData.direccion.message}</p>}
                  </div>

                  {/* Fila 4 */}
                  <div>
                    <Label htmlFor="localidad">Localidad</Label>
                    <Input id="localidad" {...register("personalData.localidad")} />
                    {errors.personalData?.localidad && <p className="text-red-500 text-xs">{errors.personalData.localidad.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="codigoPostal">Código Postal</Label>
                    <Input id="codigoPostal" {...register("personalData.codigoPostal")} />
                    {errors.personalData?.codigoPostal && <p className="text-red-500 text-xs">{errors.personalData.codigoPostal.message}</p>}
                  </div>
                   <div>
                    <Label htmlFor="telefono1">Teléfono 1</Label>
                    <Input id="telefono1" {...register("personalData.telefono1")} />
                    {errors.personalData?.telefono1 && <p className="text-red-500 text-xs">{errors.personalData.telefono1.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="telefono2">Teléfono 2</Label>
                    <Input id="telefono2" {...register("personalData.telefono2")} />
                    {errors.personalData?.telefono2 && <p className="text-red-500 text-xs">{errors.personalData.telefono2.message}</p>}
                  </div>

                  {/* Fila 5 */}
                  <div>
                    <Label>Carnet de Conducir</Label>
                    <Controller
                      name="personalData.carnetConducir"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Vehículo Propio</Label>
                    <Controller
                      name="personalData.vehiculoPropio"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numeroSeguridadSocial">Nº Seguridad Social</Label>
                    <Input id="numeroSeguridadSocial" {...register("personalData.numeroSeguridadSocial")} />
                    {errors.personalData?.numeroSeguridadSocial && <p className="text-red-500 text-xs">{errors.personalData.numeroSeguridadSocial.message}</p>}
                  </div>
                  <div></div>

                  {/* Fila 6 - Discapacidad */}
                  <div className="lg:col-span-4">
                    <Label>¿Tiene discapacidad?</Label>
                    <Controller
                      name="personalData.tieneDiscapacidad"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">Sí</SelectItem>
                            <SelectItem value="NO">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
  
                  {/* Fila 7+ - Campos condicionales de discapacidad */}
                  {tieneDiscapacidad === "SI" && (
                    <>
                      <div>
                        <Label htmlFor="porcentajeDiscapacidad">% Discapacidad</Label>
                        <Input id="porcentajeDiscapacidad" type="number" {...register("personalData.porcentajeDiscapacidad", { valueAsNumber: true })} />
                        {errors.personalData?.porcentajeDiscapacidad && <p className="text-red-500 text-xs">{errors.personalData.porcentajeDiscapacidad.message}</p>}
                      </div>
                      <div className="lg:col-span-3">
                        <Label htmlFor="tipoDiscapacidad">Tipo de Discapacidad</Label>
                        <Input id="tipoDiscapacidad" {...register("personalData.tipoDiscapacidad")} />
                        {errors.personalData?.tipoDiscapacidad && <p className="text-red-500 text-xs">{errors.personalData.tipoDiscapacidad.message}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="entidadDerivacion">Entidad de Derivación</Label>
                        <Input id="entidadDerivacion" {...register("personalData.entidadDerivacion")} />
                        {errors.personalData?.entidadDerivacion && <p className="text-red-500 text-xs">{errors.personalData.entidadDerivacion.message}</p>}
                      </div>
                      <div className="lg:col-span-3">
                        <Label htmlFor="tecnicoDerivacion">Técnico de Derivación</Label>
                        <Input id="tecnicoDerivacion" {...register("personalData.tecnicoDerivacion")} />
                        {errors.personalData?.tecnicoDerivacion && <p className="text-red-500 text-xs">{errors.personalData.tecnicoDerivacion.message}</p>}
                      </div>
                       <div className="lg:col-span-4">
                        <Label htmlFor="colectivo">Colectivo</Label>
                        <Input id="colectivo" {...register("personalData.colectivo")} />
                        {errors.personalData?.colectivo && <p className="text-red-500 text-xs">{errors.personalData.colectivo.message}</p>}
                      </div>
                    </>
                  )}
                </div>
            </Step>
            <Step>
            <div className="space-y-2 mb-6">
                <h3 className="text-xl font-semibold">Datos Socio-Económicos</h3>
                <p className="text-sm text-gray-500">Información sobre el entorno familiar y económico.</p>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="composicionFamiliar">Composición Familiar</Label>
                  <Textarea id="composicionFamiliar" {...register("socioEconomicData.composicionFamiliar")} rows={3} />
                  {errors.socioEconomicData?.composicionFamiliar && <p className="text-red-500 text-xs">{errors.socioEconomicData.composicionFamiliar.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="situacionEconomica">Situación Económica</Label>
                  <Textarea id="situacionEconomica" {...register("socioEconomicData.situacionEconomica")} rows={3} />
                    {errors.socioEconomicData?.situacionEconomica && <p className="text-red-500 text-xs">{errors.socioEconomicData.situacionEconomica.message}</p>}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-semibold">Miembros Perceptores de Ingresos</h3>
                  {incomeMemberFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-2 bg-white/50">
                      <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Miembro {index + 1}</h4>
                        <Button variant="ghost" size="sm" onClick={() => removeIncomeMember(index)}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Número</Label>
                          <Input type="number" {...register(`incomeMembers.${index}.numero`, { valueAsNumber: true })} />
                          {errors.incomeMembers?.[index]?.numero && <p className="text-red-500 text-xs">{errors.incomeMembers[index].numero.message}</p>}
                        </div>
                        <div>
                          <Label>Tipo</Label>
                          <Input {...register(`incomeMembers.${index}.tipo`)} />
                           {errors.incomeMembers?.[index]?.tipo && <p className="text-red-500 text-xs">{errors.incomeMembers[index].tipo.message}</p>}
                        </div>
                          <div>
                          <Label>Cantidad (€)</Label>
                          <Input type="number" {...register(`incomeMembers.${index}.cantidad`, { valueAsNumber: true })} />
                           {errors.incomeMembers?.[index]?.cantidad && <p className="text-red-500 text-xs">{errors.incomeMembers[index].cantidad.message}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => appendIncomeMember({ numero: 1, tipo: "", cantidad: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Añadir Miembro
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otrasCircunstancias">Otras situaciones y circunstancias de interés</Label>
                  <Textarea id="otrasCircunstancias" {...register("socioEconomicData.otrasCircunstancias")} rows={3} />
                  {errors.socioEconomicData?.otrasCircunstancias && <p className="text-red-500 text-xs">{errors.socioEconomicData.otrasCircunstancias.message}</p>}
                </div>
            </div>
          </Step>
          <Step>
             <div className="space-y-2 mb-6">
                <h3 className="text-xl font-semibold">Datos Formativos y Laborales</h3>
                <p className="text-sm text-gray-500">Formación académica, complementaria y experiencia laboral.</p>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label>Formación Académica</Label>
                    <Controller
                      name="educationData.formacionAcademica"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SIN_ESTUDIOS">Sin estudios</SelectItem>
                            <SelectItem value="ESTUDIOS_PRIMARIOS">Estudios primarios</SelectItem>
                            <SelectItem value="CERTIFICADO_ESCOLARIDAD">Certificado de escolaridad</SelectItem>
                            <SelectItem value="EGB">E.G.B</SelectItem>
                            <SelectItem value="ESO">E.S.O</SelectItem>
                            <SelectItem value="BACHILLER">Bachillerato</SelectItem>
                            <SelectItem value="FPI_CICLO_GRADO_MEDIO">Grado Medio</SelectItem>
                            <SelectItem value="FPII_CICLO_GRADO_SUPERIOR">Grado Superior</SelectItem>
                            <SelectItem value="DIPLOMADO_ING_TECNICO">Diplomado/Ing. Técnico</SelectItem>
                            <SelectItem value="LICENCIADO_ING_SUPERIOR">Licenciado/Ing. Superior</SelectItem>
                              <SelectItem value="OTROS">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="anioFinalizacion">Año de Finalización</Label>
                    <Input id="anioFinalizacion" type="number" {...register("educationData.anioFinalizacion", { valueAsNumber: true })} />
                    {errors.educationData?.anioFinalizacion && <p className="text-red-500 text-xs">{errors.educationData.anioFinalizacion.message}</p>}
                  </div>
                  {mostrarEspecificacion() && (
                    <div className="md:col-span-2">
                      <Label>{getLabelEspecificacion()}</Label>
                      <Input {...register("educationData.especificacionOtros")} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienciaLaboralPrevia">Experiencia Laboral Previa</Label>
                  <Textarea id="experienciaLaboralPrevia" {...register("educationData.experienciaLaboralPrevia")} rows={4} />
                  {errors.educationData?.experienciaLaboralPrevia && <p className="text-red-500 text-xs">{errors.educationData.experienciaLaboralPrevia.message}</p>}
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-semibold">Formación Complementaria</h3>
                  {courseFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-4 bg-white/50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Curso {index + 1}</h4>
                        <Button variant="ghost" size="sm" onClick={() => removeCourse(index)}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label>Nombre del curso</Label>
                          <Input {...register(`complementaryCourses.${index}.nombreCurso`)} />
                           {errors.complementaryCourses?.[index]?.nombreCurso && <p className="text-red-500 text-xs">{errors.complementaryCourses[index].nombreCurso.message}</p>}
                        </div>
                        <div>
                          <Label>Duración (horas)</Label>
                          <Input type="number" {...register(`complementaryCourses.${index}.duracionHoras`, { valueAsNumber: true })} />
                          {errors.complementaryCourses?.[index]?.duracionHoras && <p className="text-red-500 text-xs">{errors.complementaryCourses[index].duracionHoras.message}</p>}
                        </div>
                        <div>
                          <Label>Entidad</Label>
                          <Input {...register(`complementaryCourses.${index}.entidad`)} />
                          {errors.complementaryCourses?.[index]?.entidad && <p className="text-red-500 text-xs">{errors.complementaryCourses[index].entidad.message}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Fecha de realización</Label>
                          <Input type="date" {...register(`complementaryCourses.${index}.fechaRealizacion`)} />
                          {errors.complementaryCourses?.[index]?.fechaRealizacion && <p className="text-red-500 text-xs">{errors.complementaryCourses[index].fechaRealizacion.message}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => appendCourse({ nombreCurso: "", duracionHoras: 0, entidad: "", fechaRealizacion: new Date().toISOString().split('T')[0] })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Añadir Curso
                  </Button>
                </div>
            </div>
          </Step>
          <Step>
            <div className="space-y-2 mb-6">
                <h3 className="text-xl font-semibold">Inserción</h3>
                <p className="text-sm text-gray-500">Estado de la inserción laboral del usuario.</p>
            </div>
            <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>¿Inserción Laboral?</Label>
                  <Controller
                    name="insercion.insertado"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SI">Sí</SelectItem>
                          <SelectItem value="NO">No</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {insertado === "SI" && (
                  <>
                    <div className="space-y-2">
                        <Label>Sector</Label>
                        <Controller
                        name="insercion.sector"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Selecciona un sector" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agricultura">Agricultura</SelectItem>
                              <SelectItem value="hortofruticola">Hortofrutícola</SelectItem>
                              <SelectItem value="obra">Obra</SelectItem>
                              <SelectItem value="ganaderia">Ganadería</SelectItem>
                              <SelectItem value="servicios">Servicios</SelectItem>
                              <SelectItem value="industria">Industria</SelectItem>
                              <SelectItem value="hosteleria">Hostelería</SelectItem>
                              <SelectItem value="comercio">Comercio</SelectItem>
                              <SelectItem value="otros">Otros</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa">Empresa</Label>
                      <Input id="empresa" {...register("insercion.empresa")} />
                    </div>
                  </>
                )}
            </div>
          </Step>
          <Step>
             <div className="space-y-2 mb-6">
                <h3 className="text-xl font-semibold">Currículum</h3>
                <p className="text-sm text-gray-500">Sube y gestiona el currículum del usuario.</p>
            </div>
            <div className="max-w-lg mx-auto">
              <Card className="bg-white/50">
                <CardHeader><CardTitle>Gestión de Currículum</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Sube un archivo (.doc, .docx, max 5MB).
                  </p>
                  <CurriculumUploader
                    userId={user?.id}
                    existingCurriculumUrl={curriculumUrl}
                    onUploadComplete={handleCurriculumUploadComplete}
                    onDeleteComplete={handleCurriculumDeleteComplete}
                  />
                </CardContent>
              </Card>
            </div>
          </Step>
          </Stepper>
        </div>
      </form>
    </div>
  )
}
// NOTE: The content for the tabs "personal", "socio", "education", and "insercion" is omitted for brevity, but it's the same as the original file.
