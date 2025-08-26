import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = searchParams.get('sector') || undefined

    const whereBase: any = { insertado: 'SI' }
    if (sector && sector !== 'TODOS') {
      whereBase.sector = sector
    }

    const [total, users, companies] = await Promise.all([
      db.userProfile.count({ where: whereBase }),
      db.userProfile.findMany({
        where: whereBase,
        select: { id: true, nombre: true, apellidos: true, sector: true, empresa: true },
        orderBy: { createdAt: 'desc' }
      }),
      db.userProfile.groupBy({
        by: ['empresa'],
        where: whereBase,
        _count: { _all: true },
      })
    ])

    const companyRanking = companies
      .map((c) => ({ empresa: c.empresa ?? 'Sin especificar', count: c._count._all }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ total, users, companies: companyRanking })
  } catch (error) {
    console.error('Error fetching stats insercion:', error)
    return NextResponse.json(
      { error: 'Error fetching stats insercion' },
      { status: 500 }
    )
  }
}


