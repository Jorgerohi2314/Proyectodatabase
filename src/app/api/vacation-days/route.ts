import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const VACATION_DAYS_ALLOWANCE = 30

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (use YYYY-MM-DD).')

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00Z`)
}

/**
 * GET /api/vacation-days
 * Devuelve la lista de días marcados como vacaciones (claves YYYY-MM-DD).
 */
export async function GET() {
  try {
    const days = await db.vacationDay.findMany({
      orderBy: { date: 'asc' },
      select: { date: true },
    })

    return NextResponse.json(days.map(d => d.date.toISOString().split('T')[0]))
  } catch (error) {
    console.error('Error fetching vacation days:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener los días de vacaciones.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vacation-days
 * Marca un día como vacaciones. Body: { "date": "YYYY-MM-DD" }
 * Limita la bolsa a VACATION_DAYS_ALLOWANCE días.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const dateKey = body?.date

    const validation = dateSchema.safeParse(dateKey)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Fecha inválida. Use el formato YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    const date = parseDateKey(validation.data)

    const existing = await db.vacationDay.findUnique({ where: { date } })
    if (existing) {
      return NextResponse.json(
        { error: 'Este día ya está marcado como vacaciones.' },
        { status: 409 }
      )
    }

    const count = await db.vacationDay.count()
    if (count >= VACATION_DAYS_ALLOWANCE) {
      return NextResponse.json(
        { error: `La bolsa de vacaciones está completa (${VACATION_DAYS_ALLOWANCE} días). Elimina un día para poder añadir otro.` },
        { status: 400 }
      )
    }

    const created = await db.vacationDay.create({ data: { date } })

    return NextResponse.json(
      { date: created.date.toISOString().split('T')[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating vacation day:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar el día de vacaciones.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vacation-days?date=YYYY-MM-DD
 * Retira la marca de vacaciones de un día concreto.
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

    const existing = await db.vacationDay.findUnique({
      where: { date: parseDateKey(dateKey) },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Este día no está marcado como vacaciones.' },
        { status: 404 }
      )
    }

    await db.vacationDay.delete({ where: { id: existing.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vacation day:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar el día de vacaciones.' },
      { status: 500 }
    )
  }
}