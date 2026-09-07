import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'
import { calcularEdad } from '@/lib/utils/edad'

// Función para verificar si necesitamos agregar una nueva página
function checkPageBreak(pdf: jsPDF, yPosition: number, margin: number, neededSpace: number = 28): number {
  const pageHeight = pdf.internal.pageSize.height
  if (yPosition + neededSpace > pageHeight - margin) {
    pdf.addPage()
    return margin
  }
  return yPosition
}

// Función para agregar texto con manejo de salto de página
function addTextWithPageBreak(pdf: jsPDF, text: string, x: number, yPosition: number, maxWidth: number, lineHeight: number = 7): number {
  const lines = pdf.splitTextToSize(text, maxWidth)
  const margin = 20
  
  for (const line of lines) {
    yPosition = checkPageBreak(pdf, yPosition, margin, lineHeight)
    pdf.text(line, x, yPosition)
    yPosition += lineHeight
  }
  
  return yPosition
}

// Función para agregar un título de sección
function addSectionTitle(pdf: jsPDF, title: string, yPosition: number): number {
  const margin = 20
  yPosition = checkPageBreak(pdf, yPosition, margin, 30)
  
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, 20, yPosition)
  
  // Agregar línea subrayada
  pdf.setLineWidth(0.5)
  pdf.line(20, yPosition + 2, 190, yPosition + 2)
  
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)
  
  return yPosition + 20
}

// Función para agregar un subtítulo
function addSubTitle(pdf: jsPDF, title: string, yPosition: number): number {
  const margin = 20
  yPosition = checkPageBreak(pdf, yPosition, margin, 18)
  
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, 20, yPosition)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)
  
  return yPosition + 14
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.userProfile.findUnique({
      where: { id },
      include: {
        socioEconomicData: true,
        educationData: true,
        complementaryCourses: true,
        incomeMembers: true,
        diaryEntries: {
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Crear PDF con orientación vertical
    const pdf = new jsPDF('p', 'mm', 'a4')
    const margin = 20
    const maxWidth = 170
    let yPosition = margin

    // Configurar fuentes
    pdf.setFont('helvetica')
    
    // Agregar logo o encabezado
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FICHA DE ENTREVISTA DE USUARIOS', 105, yPosition, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    yPosition += 24

    // Fecha de generación
    pdf.setFontSize(10)
    pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 190, yPosition, { align: 'right' })
    pdf.setFontSize(12)
    yPosition += 18

    // Línea divisoria
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPosition, 190, yPosition)
    yPosition += 12

    // === DATOS PERSONALES ===
    yPosition = addSectionTitle(pdf, 'DATOS PERSONALES', yPosition)
    
    // Datos básicos en dos columnas
    const leftColumn = 20
    const rightColumn = 110
    
    yPosition = checkPageBreak(pdf, yPosition, margin, 50)
    
    // Columna izquierda
    pdf.text(`Nombre: ${user.nombre}`, leftColumn, yPosition)
    pdf.text(`Apellidos: ${user.apellidos}`, leftColumn, yPosition + 10)
    pdf.text(`Fecha Nacimiento: ${new Date(user.fechaNacimiento).toLocaleDateString('es-ES')}`, leftColumn, yPosition + 20)
    pdf.text(`Edad: ${calcularEdad(user.fechaNacimiento)} años`, leftColumn, yPosition + 30)
    pdf.text(`Nacionalidad: ${user.nacionalidad}`, leftColumn, yPosition + 40)
    
    // Columna derecha
    pdf.text(`Documento: ${user.documentoIdentidad}`, rightColumn, yPosition)
    if (user.numeroSeguridadSocial) {
      pdf.text(`Nº Seguridad Social: ${user.numeroSeguridadSocial}`, rightColumn, yPosition + 10)
    }
    pdf.text(`Sexo: ${user.sexo}`, rightColumn, yPosition + (user.numeroSeguridadSocial ? 20 : 10))
    pdf.text(`Localidad: ${user.localidad}`, rightColumn, yPosition + (user.numeroSeguridadSocial ? 30 : 20))
    if (user.codigoPostal) {
      pdf.text(`C.P.: ${user.codigoPostal}`, rightColumn, yPosition + (user.numeroSeguridadSocial ? 40 : 30))
    }
    
    yPosition += user.numeroSeguridadSocial ? 60 : 50

    // Dirección
    yPosition = checkPageBreak(pdf, yPosition, margin, 18)
    pdf.text(`Dirección: ${user.direccion}`, leftColumn, yPosition)
    yPosition += 12

    // Contacto
    yPosition = checkPageBreak(pdf, yPosition, margin, 24)
    if (user.telefono1) {
      pdf.text(`Teléfono 1: ${user.telefono1}`, leftColumn, yPosition)
      yPosition += 10
    }
    if (user.telefono2) {
      pdf.text(`Teléfono 2: ${user.telefono2}`, leftColumn, yPosition)
      yPosition += 10
    }
    if (user.email) {
      pdf.text(`Email: ${user.email}`, leftColumn, yPosition)
      yPosition += 10
    }

    // Vehículo y carnet
    yPosition = checkPageBreak(pdf, yPosition, margin, 24)
    pdf.text(`Carnet de conducir: ${user.carnetConducir}`, leftColumn, yPosition)
    pdf.text(`Vehículo propio: ${user.vehiculoPropio}`, rightColumn, yPosition)
    yPosition += 18

    // === DISCAPACIDAD ===
    if (user.tieneDiscapacidad === 'SI') {
      yPosition = addSubTitle(pdf, 'INFORMACIÓN DE DISCAPACIDAD', yPosition)
      
      yPosition = checkPageBreak(pdf, yPosition, margin, 30)
      if (user.porcentajeDiscapacidad) {
        pdf.text(`Porcentaje: ${user.porcentajeDiscapacidad}%`, leftColumn, yPosition)
        yPosition += 10
      }
      if (user.tipoDiscapacidad) {
        pdf.text(`Tipo: ${user.tipoDiscapacidad}`, leftColumn, yPosition)
        yPosition += 10
      }
      if (user.entidadDerivacion) {
        pdf.text(`Entidad Derivación: ${user.entidadDerivacion}`, leftColumn, yPosition)
        yPosition += 10
      }
      if (user.tecnicoDerivacion) {
        pdf.text(`Técnico Derivación: ${user.tecnicoDerivacion}`, leftColumn, yPosition)
        yPosition += 10
      }
      if (user.colectivo) {
        pdf.text(`Colectivo: ${user.colectivo}`, leftColumn, yPosition)
        yPosition += 10
      }
      yPosition += 14
    }

    // === DATOS SOCIO-FAMILIARES Y ECONÓMICOS ===
    if (user.socioEconomicData) {
      yPosition = addSectionTitle(pdf, 'DATOS SOCIO-FAMILIARES Y ECONÓMICOS', yPosition)
      
      // 1. Composición Familiar
      yPosition = addSubTitle(pdf, '1. COMPOSICIÓN FAMILIAR', yPosition)
      yPosition = addTextWithPageBreak(pdf, user.socioEconomicData.composicionFamiliar, leftColumn, yPosition, maxWidth, 7)
      yPosition += 12

      // 2. Situación Económica
      yPosition = addSubTitle(pdf, '2. SITUACIÓN ECONÓMICA', yPosition)
      yPosition = addTextWithPageBreak(pdf, user.socioEconomicData.situacionEconomica, leftColumn, yPosition, maxWidth, 7)
      yPosition += 12

      // 3. Miembros Perceptores de Ingresos
      if (user.incomeMembers && user.incomeMembers.length > 0) {
        yPosition = addSubTitle(pdf, 'MIEMBROS PERCEPTORES DE INGRESOS', yPosition)
        
        user.incomeMembers.forEach((member, index) => {
          yPosition = checkPageBreak(pdf, yPosition, margin, 30)
          pdf.text(`Miembro ${index + 1}:`, leftColumn, yPosition)
          yPosition += 10
          pdf.text(`  • Número: ${member.numero}`, leftColumn + 5, yPosition)
          yPosition += 8
          pdf.text(`  • Tipo: ${member.tipo}`, leftColumn + 5, yPosition)
          yPosition += 8
          pdf.text(`  • Cantidad: €${member.cantidad.toFixed(2)}`, leftColumn + 5, yPosition)
          yPosition += 12
        })
      }

      // 4. Otras Circunstancias
      if (user.socioEconomicData.otrasCircunstancias) {
        yPosition = addSubTitle(pdf, '3. OTRAS SITUACIONES Y CIRCUNSTANCIAS DE INTERÉS', yPosition)
        yPosition = addTextWithPageBreak(pdf, user.socioEconomicData.otrasCircunstancias, leftColumn, yPosition, maxWidth, 7)
        yPosition += 12
      }
    }

    // === DATOS FORMATIVOS Y LABORALES ===
    if (user.educationData) {
      yPosition = addSectionTitle(pdf, 'DATOS FORMATIVOS Y LABORALES', yPosition)
      
      // Formación Académica
      yPosition = addSubTitle(pdf, 'FORMACIÓN ACADÉMICA', yPosition)
      
      yPosition = checkPageBreak(pdf, yPosition, margin, 24)
      const nivelFormacion = user.educationData.formacionAcademica.replace(/_/g, ' ')
      pdf.text(`Nivel: ${nivelFormacion}`, leftColumn, yPosition)
      yPosition += 12
      
      if (user.educationData.especificacionOtros) {
        pdf.text(`Especificación: ${user.educationData.especificacionOtros}`, leftColumn, yPosition)
        yPosition += 12
      }
      
      if (user.educationData.anioFinalizacion) {
        pdf.text(`Año Finalización: ${user.educationData.anioFinalizacion}`, leftColumn, yPosition)
        yPosition += 12
      }

      // Experiencia Laboral Previa
      if (user.educationData.experienciaLaboralPrevia) {
        yPosition = addSubTitle(pdf, 'EXPERIENCIA LABORAL PREVIA', yPosition)
        yPosition = addTextWithPageBreak(pdf, user.educationData.experienciaLaboralPrevia, leftColumn, yPosition, maxWidth, 7)
        yPosition += 12
      }
    }

    // === FORMACIÓN COMPLEMENTARIA ===
    if (user.complementaryCourses && user.complementaryCourses.length > 0) {
      yPosition = addSectionTitle(pdf, 'FORMACIÓN COMPLEMENTARIA', yPosition)
      
      user.complementaryCourses.forEach((course, index) => {
        yPosition = checkPageBreak(pdf, yPosition, margin, 40)
        pdf.text(`Curso ${index + 1}:`, leftColumn, yPosition)
        yPosition += 10
        pdf.text(`  • Nombre: ${course.nombreCurso}`, leftColumn + 5, yPosition)
        yPosition += 8
        pdf.text(`  • Duración: ${course.duracionHoras} horas`, leftColumn + 5, yPosition)
        yPosition += 8
        pdf.text(`  • Entidad: ${course.entidad}`, leftColumn + 5, yPosition)
        yPosition += 8
        pdf.text(`  • Fecha: ${new Date(course.fechaRealizacion).toLocaleDateString('es-ES')}`, leftColumn + 5, yPosition)
        yPosition += 14
      })
    }

    // === ENTRADAS DE DIARIO ===
    if (user.diaryEntries && user.diaryEntries.length > 0) {
      yPosition = addSectionTitle(pdf, 'ENTRADAS DE DIARIO', yPosition)
      
      user.diaryEntries.forEach((entry, index) => {
        yPosition = checkPageBreak(pdf, yPosition, margin, 50)
        
        // Fecha de la entrada
        const entryDate = new Date(entry.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        pdf.setFont('helvetica', 'bold')
        pdf.text(`Entrada ${index + 1} - ${entryDate}`, leftColumn, yPosition)
        yPosition += 10
        
        // Horas si existen
        if (entry.horas !== null && entry.horas !== undefined) {
          pdf.setFont('helvetica', 'normal')
          pdf.text(`Horas: ${entry.horas}`, rightColumn, yPosition - 10)
        }
        
        // Contenido de la entrada
        pdf.setFont('helvetica', 'normal')
        yPosition = addTextWithPageBreak(pdf, entry.content, leftColumn, yPosition, maxWidth, 6)
        yPosition += 12
        
        // Línea separadora entre entradas
        if (index < user.diaryEntries.length - 1) {
          yPosition = checkPageBreak(pdf, yPosition, margin, 10)
          pdf.setLineWidth(0.3)
          pdf.line(leftColumn, yPosition, 190, yPosition)
          yPosition += 10
        }
      })
    } else {
      yPosition = addSectionTitle(pdf, 'ENTRADAS DE DIARIO', yPosition)
      yPosition = checkPageBreak(pdf, yPosition, margin, 20)
      pdf.setFont('helvetica', 'italic')
      pdf.text('No hay entradas de diario registradas.', leftColumn, yPosition)
      pdf.setFont('helvetica', 'normal')
      yPosition += 14
    }

    // Pie de página
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' })
      
      if (i === 1) {
        pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 105, 283, { align: 'center' })
      }
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
