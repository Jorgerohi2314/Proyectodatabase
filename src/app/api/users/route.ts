import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      nombre: searchParams.get('nombre') || undefined,
      apellidos: searchParams.get('apellidos') || undefined,
      localidad: searchParams.get('localidad') || undefined,
      tieneDiscapacidad: searchParams.get('tieneDiscapacidad') || undefined,
      formacionAcademica: searchParams.get('formacionAcademica') || undefined,
      idiomas: searchParams.get('idiomas') || undefined,
      informatica: searchParams.get('informatica') || undefined,
    }

    const whereClause: any = {}

    if (filters.nombre) {
      whereClause.nombre = { contains: filters.nombre, mode: 'insensitive' }
    }
    if (filters.apellidos) {
      whereClause.apellidos = { contains: filters.apellidos, mode: 'insensitive' }
    }
    if (filters.localidad) {
      whereClause.localidad = { contains: filters.localidad, mode: 'insensitive' }
    }
    if (filters.tieneDiscapacidad) {
      whereClause.tieneDiscapacidad = filters.tieneDiscapacidad
    }
    if (filters.formacionAcademica) {
      whereClause.educationData = {
        formacionAcademica: filters.formacionAcademica
      }
    }
    if (filters.idiomas || filters.informatica) {
      whereClause.complementaryCourses = {
        some: {}
      }
      if (filters.idiomas) {
        whereClause.complementaryCourses.some.nombreCurso = { 
          contains: filters.idiomas, 
          mode: 'insensitive' 
        }
      }
      if (filters.informatica) {
        whereClause.complementaryCourses.some.nombreCurso = { 
          contains: filters.informatica, 
          mode: 'insensitive' 
        }
      }
    }

    const users = await db.userProfile.findMany({
      where: whereClause,
      include: {
        socioEconomicData: true,
        educationData: true,
        complementaryCourses: true,
        incomeMembers: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
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
        fechaNacimiento: new Date(data.fechaNacimiento),
        edad: data.edad,
        nacionalidad: data.nacionalidad,
        documentoIdentidad: data.documentoIdentidad,
        sexo: data.sexo,
        direccion: data.direccion,
        localidad: data.localidad,
        codigoPostal: data.codigoPostal,
        telefono1: data.telefono1,
        telefono2: data.telefono2,
        email: data.email,
        carnetConducir: data.carnetConducir,
        vehiculoPropio: data.vehiculoPropio,
        tieneDiscapacidad: data.tieneDiscapacidad,
        porcentajeDiscapacidad: data.porcentajeDiscapacidad,
        tipoDiscapacidad: data.tipoDiscapacidad,
        entidadDerivacion: data.entidadDerivacion,
        tecnicoDerivacion: data.tecnicoDerivacion,
        colectivo: data.colectivo,
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