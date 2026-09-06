import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createEntrySchema = z.object({
  date: z.string().transform(val => new Date(val)),
  horas: z.number().min(0).max(24),
  userId: z.string().optional(),
})

export async function GET() {
  try {
    const diaryEntries = await db.diaryEntry.findMany({
      where: {
        horas: { not: null },
      },
      select: {
        date: true,
        horas: true,
        content: true,
        userProfile: {
          select: {
            nombre: true,
            apellidos: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    const result = diaryEntries.map(entry => ({
      date: entry.date.toISOString().split('T')[0],
      hours: entry.horas ?? 0,
      content: entry.content,
      userName: `${entry.userProfile.nombre} ${entry.userProfile.apellidos ?? ''}`.trim(),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching diary entries:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las entradas del diario.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createEntrySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validación fallida', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { date, horas, userId } = validation.data

    let targetUserId = userId
    if (!targetUserId) {
      const firstUser = await db.userProfile.findFirst()
      if (!firstUser) {
        return NextResponse.json(
          { error: 'No hay usuarios disponibles. Cree un usuario primero.' },
          { status: 400 }
        )
      }
      targetUserId = firstUser.id
    }

    const newEntry = await db.diaryEntry.create({
      data: {
        date,
        horas,
        content: `Entrada de progreso - ${date.toISOString().split('T')[0]}`,
        userProfileId: targetUserId,
      },
    })

    return NextResponse.json({
      date: newEntry.date.toISOString().split('T')[0],
      hours: newEntry.horas ?? 0,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating diary entry:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al crear la entrada del diario.' },
      { status: 500 }
    )
  }
}