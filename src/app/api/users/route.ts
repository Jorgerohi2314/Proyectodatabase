import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { normalizeNationality } from '@/lib/data/nationalities'
import { calcularEdad } from '@/lib/utils/edad'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      nombre: searchParams.get('nombre') || undefined,
      apellidos: searchParams.get('apellidos') || undefined,
      formacionAcademica: searchParams.get('formacionAcademica') || undefined,
      experienciaLaboralPrevia: searchParams.get('experienciaLaboralPrevia') || undefined,
      garantiaJuvenil: searchParams.get('garantiaJuvenil') || undefined,
      edadMax30: searchParams.get('edadMax30') || undefined,
    }

    const whereClause: any = {}

    // Only apply exact match filters at DB level for better performance
    if (filters.formacionAcademica) {
      whereClause.educationData = {
        formacionAcademica: filters.formacionAcademica
      }
    }

    if (filters.garantiaJuvenil) {
      whereClause.garantiaJuvenil = filters.garantiaJuvenil
    }

    const users = await db.userProfile.findMany({
      where: whereClause,
      include: {
        socioEconomicData: true,
        educationData: true,
        complementaryCourses: true,
        incomeMembers: true,
        diaryEntries: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { date: true },
        },
      },
    })

    // Calculate effective last update for each user (max of updatedAt and latest diary entry)
    const usersWithEffectiveUpdate = users.map(user => {
      const latestDiaryDate = user.diaryEntries[0]?.date
      const effectiveUpdate = latestDiaryDate && new Date(latestDiaryDate) > new Date(user.updatedAt)
        ? new Date(latestDiaryDate)
        : user.updatedAt
      return { ...user, effectiveUpdate }
    })

    // Sort by effective update descending (most recent first)
    usersWithEffectiveUpdate.sort((a, b) => 
      new Date(b.effectiveUpdate).getTime() - new Date(a.effectiveUpdate).getTime()
    )

    // Helper for accent and case insensitive comparison
    const normalizeText = (text: string) => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    }

    // Filter in memory for text fields to support full accent/case insensitivity
    const filteredUsers = usersWithEffectiveUpdate.filter(user => {
      let matches = true

      if (filters.nombre) {
        const userNombre = normalizeText(user.nombre || '')
        const filterNombre = normalizeText(filters.nombre)
        if (!userNombre.includes(filterNombre)) matches = false
      }

      if (matches && filters.apellidos) {
        const userApellidos = normalizeText(user.apellidos || '')
        const filterApellidos = normalizeText(filters.apellidos)
        if (!userApellidos.includes(filterApellidos)) matches = false
      }

      if (matches && filters.experienciaLaboralPrevia) {
        const userExperiencia = normalizeText(user.educationData?.experienciaLaboralPrevia || '')
        const filterExperiencia = normalizeText(filters.experienciaLaboralPrevia)
        if (!userExperiencia.includes(filterExperiencia)) matches = false
      }

      if (matches && filters.edadMax30) {
        const edad = calcularEdad(user.fechaNacimiento as unknown as Date)
        if (edad > 30) matches = false
      }

      return matches
    })

    return NextResponse.json(filteredUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const user = await db.userProfile.create({
      data: {
        nombre: data.nombre,
        apellidos: data.apellidos,
        source: data.source,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : new Date(),
        nacionalidad: normalizeNationality(data.nacionalidad),
        documentoIdentidad: data.documentoIdentidad,
        numeroSeguridadSocial: data.numeroSeguridadSocial,
        sexo: data.sexo,
        direccion: data.direccion,
        localidad: data.localidad,
        codigoPostal: data.codigoPostal,
        telefono1: data.telefono1,
        telefono2: data.telefono2,
        email: data.email,
        carnetConducir: data.carnetConducir,
        vehiculoPropio: data.vehiculoPropio,
        garantiaJuvenil: data.garantiaJuvenil ?? 'NO',
        tieneDiscapacidad: data.tieneDiscapacidad,
        porcentajeDiscapacidad: data.porcentajeDiscapacidad,
        tipoDiscapacidad: data.tipoDiscapacidad,
        entidadDerivacion: data.entidadDerivacion,
        tecnicoDerivacion: data.tecnicoDerivacion,
        colectivo: data.colectivo,
        insertado: data.insertado ?? 'NO',
        sector: data.sector,
        empresa: data.empresa,
        localidadInsercion: data.localidadInsercion,
        socioEconomicData: data.socioEconomicData ? {
          create: {
            composicionFamiliar: data.socioEconomicData.composicionFamiliar,
            situacionEconomica: data.socioEconomicData.situacionEconomica,
            otrasCircunstancias: data.socioEconomicData.otrasCircunstancias,
          }
        } : undefined,
        educationData: data.educationData ? {
          create: {
            formacionAcademica: data.educationData.formacionAcademica,
            anioFinalizacion: data.educationData.anioFinalizacion,
            especificacionOtros: data.educationData.especificacionOtros,
            experienciaLaboralPrevia: data.educationData.experienciaLaboralPrevia,
          }
        } : undefined,
        complementaryCourses: {
          create: data.complementaryCourses?.map((course: any) => ({
            nombreCurso: course.nombreCurso,
            duracionHoras: course.duracionHoras,
            entidad: course.entidad,
            fechaRealizacion: new Date(course.fechaRealizacion),
          })) || [],
        },
        incomeMembers: {
          create: data.incomeMembers?.map((member: any) => ({
            numero: member.numero,
            tipo: member.tipo,
            cantidad: member.cantidad,
          })) || [],
        },
      },
      include: {
        socioEconomicData: true,
        educationData: true,
        complementaryCourses: true,
        incomeMembers: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    )
  }
}