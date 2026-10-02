import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const MAX_CONTENT_LENGTH = 500

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (use YYYY-MM-DD).')

const annotationSchema = z.object({
  date: dateSchema,
  content: z
    .string()
    .trim()
    .min(1, 'La anotación no puede estar vacía.')
    .max(MAX_CONTENT_LENGTH, `La anotación no puede superar los ${MAX_CONTENT_LENGTH} caracteres.`),
})

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00Z`)
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * GET /api/day-annotations
 * Devuelve las anotaciones de todos los días ({ date, content }), ordenadas por fecha.
 */
export async function GET() {
  try {
    const annotations = await db.dayAnnotation.findMany({
      orderBy: { date: 'asc' },
      select: { date: true, content: true },
    })

    return NextResponse.json(
      annotations.map(a => ({ date: toDateKey(a.date), content: a.content }))
    )
  } catch (error) {
    console.error('Error fetching day annotations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las anotaciones.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/day-annotations
 * Guarda la anotación de un día (crea o actualiza si ya existía). Body: { "date": "YYYY-MM-DD", "content": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = annotationSchema.safeParse(body)

    if (!validation.success) {
      const issues = validation.error.flatten().fieldErrors
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]?.message ??
            'Datos de la anotación no válidos.',
          details: issues,
        },
        { status: 400 }
      )
    }

    const { date, content } = validation.data
    const dateValue = parseDateKey(date)

    const existing = await db.dayAnnotation.findUnique({ where: { date: dateValue } })

    const saved = await db.dayAnnotation.upsert({
      where: { date: dateValue },
      create: { date: dateValue, content },
      update: { content },
    })

    return NextResponse.json(
      { date: toDateKey(saved.date), content: saved.content },
      { status: existing ? 200 : 201 }
    )
  } catch (error) {
    console.error('Error saving day annotation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar la anotación.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/day-annotations?date=YYYY-MM-DD
 * Elimina la anotación de un día concreto.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateKey = searchParams.get('date') || ''

    const validation = dateSchema.safeParse(dateKey)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Fecha inválida. Use el formato YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    const existing = await db.dayAnnotation.findUnique({
      where: { date: parseDateKey(dateKey) },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Este día no tiene anotación.' },
        { status: 404 }
      )
    }

    await db.dayAnnotation.delete({ where: { id: existing.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting day annotation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar la anotación.' },
      { status: 500 }
    )
  }
}