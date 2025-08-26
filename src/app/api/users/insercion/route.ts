import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const grouped = await db.userProfile.groupBy({
      by: ['sector'],
      where: { insertado: 'SI' },
      _count: { _all: true },
    })

    const result = grouped
      .map((g) => ({ sector: g.sector ?? 'Sin especificar', count: g._count._all }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching insercion by sector:', error)
    return NextResponse.json(
      { error: 'Error fetching insercion by sector' },
      { status: 500 }
    )
  }
}


