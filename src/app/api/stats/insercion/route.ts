import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildInsercionWhere } from '@/lib/utils/stats-filters'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const whereBase = buildInsercionWhere(searchParams)

    const [total, users, companies, sexoStats, nacionalidadStats, localidadStats, localidadInsercionStats, sectorInsercionStats] = await Promise.all([
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
      }),
      db.userProfile.groupBy({
        by: ['sexo'],
        where: whereBase,
        _count: { _all: true },
      }),
      db.userProfile.groupBy({
        by: ['nacionalidad'],
        where: whereBase,
        _count: { _all: true },
      }),
      db.userProfile.groupBy({
        by: ['localidad'],
        where: whereBase,
        _count: { _all: true },
      }),
      db.userProfile.groupBy({
        by: ['localidadInsercion'],
        where: { ...whereBase, insertado: 'SI', localidadInsercion: { not: null } },
        _count: { _all: true },
      }),
      db.userProfile.groupBy({
        by: ['sector'],
        where: { ...whereBase, insertado: 'SI' },
        _count: { _all: true },
      })
    ])

    const companyRanking = companies
      .map((c) => ({ empresa: c.empresa ?? 'Sin especificar', count: c._count._all }))
      .sort((a, b) => b.count - a.count)

    const sexoRanking = sexoStats
      .map((s) => ({ sexo: s.sexo ?? 'Sin especificar', count: s._count._all }))
      .sort((a, b) => b.count - a.count)

    const nacionalidadRanking = nacionalidadStats
      .map((n) => ({ nacionalidad: n.nacionalidad ?? 'Sin especificar', count: n._count._all }))
      .sort((a, b) => b.count - a.count)

    const localidadRanking = localidadStats
      .map((l) => ({ localidad: l.localidad ?? 'Sin especificar', count: l._count._all }))
      .sort((a, b) => b.count - a.count)

    const localidadInsercionRanking = localidadInsercionStats
      .map((l) => ({ localidadInsercion: l.localidadInsercion ?? 'Sin especificar', count: l._count._all }))
      .sort((a, b) => b.count - a.count)

    const sectorInsercionRanking = sectorInsercionStats
      .map((s) => ({ sector: s.sector ?? 'Sin especificar', count: s._count._all }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      total,
      users,
      companies: companyRanking,
      sexo: sexoRanking,
      nacionalidad: nacionalidadRanking,
      localidad: localidadRanking,
      localidadInsercion: localidadInsercionRanking,
      sectorInsercion: sectorInsercionRanking
    })
  } catch (error) {
    console.error('Error fetching stats insercion:', error)
    return NextResponse.json(
      { error: 'Error fetching stats insercion' },
      { status: 500 }
    )
  }
}
