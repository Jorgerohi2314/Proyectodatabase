import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.userProfile.findUnique({
      where: { id: params.id },
      include: {
        socioEconomicData: true,
        educationData: true,
        complementaryCourses: true,
        incomeMembers: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Error fetching user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const existingUser = await db.userProfile.findUnique({
      where: { id: params.id },
      include: {
        socioEconomicData: true,
        educationData: true,
        complementaryCourses: true,
        incomeMembers: true,
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = await db.userProfile.update({
      where: { id: params.id },
      data: {
        nombre: data.nombre,
        apellidos: data.apellidos,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : new Date(),
        nacionalidad: data.nacionalidad,
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
        tieneDiscapacidad: data.tieneDiscapacidad,
        porcentajeDiscapacidad: data.porcentajeDiscapacidad,
        tipoDiscapacidad: data.tipoDiscapacidad,
        entidadDerivacion: data.entidadDerivacion,
        tecnicoDerivacion: data.tecnicoDerivacion,
        colectivo: data.colectivo,
        insertado: data.insertado ?? 'NO',
        sector: data.sector,
        empresa: data.empresa,
        socioEconomicData: data.socioEconomicData ? {
          upsert: {
            create: {
              composicionFamiliar: data.socioEconomicData.composicionFamiliar,
              situacionEconomica: data.socioEconomicData.situacionEconomica,
              otrasCircunstancias: data.socioEconomicData.otrasCircunstancias,
            },
            update: {
              composicionFamiliar: data.socioEconomicData.composicionFamiliar,
              situacionEconomica: data.socioEconomicData.situacionEconomica,
              otrasCircunstancias: data.socioEconomicData.otrasCircunstancias,
            }
          }
        } : undefined,
        educationData: data.educationData ? {
          upsert: {
            create: {
              formacionAcademica: data.educationData.formacionAcademica,
              anioFinalizacion: data.educationData.anioFinalizacion,
              especificacionOtros: data.educationData.especificacionOtros,
              experienciaLaboralPrevia: data.educationData.experienciaLaboralPrevia,
            },
            update: {
              formacionAcademica: data.educationData.formacionAcademica,
              anioFinalizacion: data.educationData.anioFinalizacion,
              especificacionOtros: data.educationData.especificacionOtros,
              experienciaLaboralPrevia: data.educationData.experienciaLaboralPrevia,
            }
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
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.userProfile.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Error deleting user' },
      { status: 500 }
    )
  }
}