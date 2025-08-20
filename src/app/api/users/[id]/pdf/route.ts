import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

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

    const pdf = new jsPDF()
    
    // Configuración de fuentes
    pdf.setFont('helvetica')
    
    // Título
    pdf.setFontSize(20)
    pdf.text('FICHA DE ENTREVISTA DE USUARIOS', 20, 30)
    
    // Datos Personales
    pdf.setFontSize(16)
    pdf.text('DATOS PERSONALES', 20, 50)
    
    pdf.setFontSize(12)
    let yPosition = 60
    
    pdf.text(`Nombre: ${user.nombre}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Apellidos: ${user.apellidos}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Fecha de Nacimiento: ${user.fechaNacimiento.toLocaleDateString()}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Edad: ${user.edad}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Nacionalidad: ${user.nacionalidad}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Documento de Identidad: ${user.documentoIdentidad}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Sexo: ${user.sexo}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Dirección: ${user.direccion}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Localidad: ${user.localidad}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Código Postal: ${user.codigoPostal || ''}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Teléfono 1: ${user.telefono1 || ''}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Teléfono 2: ${user.telefono2 || ''}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Email: ${user.email || ''}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Carnet de Conducir: ${user.carnetConducir}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Vehículo Propio: ${user.vehiculoPropio}`, 20, yPosition)
    
    // Discapacidad
    if (user.tieneDiscapacidad === 'SI') {
      yPosition += 15
      pdf.setFontSize(14)
      pdf.text('DISCAPACIDAD', 20, yPosition)
      yPosition += 10
      pdf.setFontSize(12)
      pdf.text(`Porcentaje: ${user.porcentajeDiscapacidad || ''}%`, 20, yPosition)
      yPosition += 10
      pdf.text(`Tipo: ${user.tipoDiscapacidad || ''}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Entidad de Derivación: ${user.entidadDerivacion || ''}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Técnico de Derivación: ${user.tecnicoDerivacion || ''}`, 20, yPosition)
      yPosition += 10
      pdf.text(`Colectivo: ${user.colectivo || ''}`, 20, yPosition)
    }
    
    // Datos Socio-Familiares y Económicos
    if (user.socioEconomicData) {
      yPosition += 15
      pdf.setFontSize(16)
      pdf.text('DATOS SOCIO-FAMILIARES Y ECONÓMICOS', 20, yPosition)
      yPosition += 10
      pdf.setFontSize(12)
      
      pdf.text('1.- COMPOSICIÓN FAMILIAR', 20, yPosition)
      yPosition += 10
      const splitComposicion = pdf.splitTextToSize(user.socioEconomicData.composicionFamiliar, 170)
      pdf.text(splitComposicion, 20, yPosition)
      yPosition += splitComposicion.length * 5 + 10
      
      pdf.text('2.- SITUACIÓN ECONÓMICA', 20, yPosition)
      yPosition += 10
      const splitSituacion = pdf.splitTextToSize(user.socioEconomicData.situacionEconomica, 170)
      pdf.text(splitSituacion, 20, yPosition)
      yPosition += splitSituacion.length * 5 + 10
      
      // Miembros perceptores de ingresos
      if (user.incomeMembers && user.incomeMembers.length > 0) {
        pdf.text('Miembros perceptores de ingresos:', 20, yPosition)
        yPosition += 10
        user.incomeMembers.forEach((member) => {
          pdf.text(`  - Número: ${member.numero}, Tipo: ${member.tipo}, Cantidad: ${member.cantidad}`, 25, yPosition)
          yPosition += 8
        })
      }
      
      if (user.socioEconomicData.otrasCircunstancias) {
        yPosition += 10
        pdf.text('3.- OTRAS SITUACIONES Y CIRCUNSTANCIAS DE INTERÉS', 20, yPosition)
        yPosition += 10
        const splitOtras = pdf.splitTextToSize(user.socioEconomicData.otrasCircunstancias, 170)
        pdf.text(splitOtras, 20, yPosition)
        yPosition += splitOtras.length * 5 + 10
      }
    }
    
    // Datos Formativos y Laborales
    if (user.educationData) {
      yPosition += 15
      pdf.setFontSize(16)
      pdf.text('DATOS FORMATIVOS Y LABORALES', 20, yPosition)
      yPosition += 10
      pdf.setFontSize(12)
      
      pdf.text('FORMACIÓN ACADÉMICA', 20, yPosition)
      yPosition += 10
      pdf.text(`Nivel: ${user.educationData.formacionAcademica}`, 20, yPosition)
      yPosition += 10
      
      if (user.educationData.especificacionOtros) {
        pdf.text(`Especificación: ${user.educationData.especificacionOtros}`, 20, yPosition)
        yPosition += 10
      }
      
      if (user.educationData.anioFinalizacion) {
        pdf.text(`Año de Finalización: ${user.educationData.anioFinalizacion}`, 20, yPosition)
        yPosition += 10
      }
      
      if (user.educationData.experienciaLaboralPrevia) {
        yPosition += 10
        pdf.text('Experiencia laboral previa:', 20, yPosition)
        yPosition += 10
        const splitExperiencia = pdf.splitTextToSize(user.educationData.experienciaLaboralPrevia, 170)
        pdf.text(splitExperiencia, 20, yPosition)
        yPosition += splitExperiencia.length * 5 + 10
      }
    }
    
    // Formación Complementaria
    if (user.complementaryCourses && user.complementaryCourses.length > 0) {
      yPosition += 15
      pdf.setFontSize(14)
      pdf.text('FORMACIÓN COMPLEMENTARIA', 20, yPosition)
      yPosition += 10
      pdf.setFontSize(12)
      
      user.complementaryCourses.forEach((course) => {
        pdf.text(`Curso: ${course.nombreCurso}`, 20, yPosition)
        yPosition += 8
        pdf.text(`Duración: ${course.duracionHoras} horas`, 25, yPosition)
        yPosition += 8
        pdf.text(`Entidad: ${course.entidad}`, 25, yPosition)
        yPosition += 8
        pdf.text(`Fecha: ${course.fechaRealizacion.toLocaleDateString()}`, 25, yPosition)
        yPosition += 12
      })
    }
    
    // Convertir el PDF a buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ficha_usuario_${user.nombre}_${user.apellidos}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error generating PDF' },
      { status: 500 }
    )
  }
}