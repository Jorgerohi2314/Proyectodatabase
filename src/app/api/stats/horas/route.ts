import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildInsercionWhere } from '@/lib/utils/stats-filters'

const UMBRAL_HORAS = 4

/**
 * GET /api/stats/horas
 * Acepta los filtros sector, laboralYear y onlyInserted.
 * Divide los usuarios según el total de horas dedicadas (suma de las entradas del diario):
 * - menosDe4: usuarios con total de horas < 4
 * - cuatroOMas: usuarios con total de horas >= 4
 * - sinRegistros: usuarios sin horas registradas en el diario
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const whereBase = buildInsercionWhere(searchParams)

    const users = await db.userProfile.findMany({
      where: whereBase,
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        diaryEntries: {
          select: { horas: true },
        },
      },
    })

    const menosDe4: Array<{ id: string; nombre: string; apellidos: string | null; totalHoras: number }> = []
    const cuatroOMas: Array<{ id: string; nombre: string; apellidos: string | null; totalHoras: number }> = []
    let sinRegistros = 0

    for (const user of users) {
      const tieneRegistros = user.diaryEntries.some((e) => e.horas != null)

      if (!tieneRegistros) {
        sinRegistros++
        continue
      }

      const totalHoras = user.diaryEntries.reduce(
        (acc, entry) => acc + (entry.horas ?? 0),
        0
      )

      const info = {
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        totalHoras: Math.round(totalHoras * 100) / 100,
      }

      if (totalHoras < UMBRAL_HORAS) {
        menosDe4.push(info)
      } else {
        cuatroOMas.push(info)
      }
    }

    return NextResponse.json({
      umbralHoras: UMBRAL_HORAS,
      counts: {
        menosDe4: menosDe4.length,
        cuatroOMas: cuatroOMas.length,
        sinRegistros,
      },
      menosDe4,
      cuatroOMas,
    })
  } catch (error) {
    console.error('Error fetching stats horas:', error)
    return NextResponse.json(
      { error: 'Error fetching stats horas' },
      { status: 500 }
    )
  }
}
