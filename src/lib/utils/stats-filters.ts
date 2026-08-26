/**
 * Construye el filtro `where` común para las estadísticas de inserción,
 * a partir de los parámetros: sector, laboralYear y onlyInserted.
 */
export function buildInsercionWhere(searchParams: URLSearchParams): any {
  const sector = searchParams.get('sector') || undefined
  const laboralYear = searchParams.get('laboralYear') || undefined
  const onlyInserted = searchParams.get('onlyInserted') === 'true'

  const whereBase: any = {
    source: 'PROPIO'
  }

  if (onlyInserted) {
    whereBase.insertado = 'SI'
  }

  if (sector && sector !== 'TODOS') {
    whereBase.sector = sector
  }

  // Filter by laboral year using updatedAt
  if (laboralYear) {
    const [startShort, endShort] = laboralYear.split('/')
    const startYear = 2000 + parseInt(startShort, 10)
    const endYear = 2000 + parseInt(endShort, 10)

    whereBase.updatedAt = {
      gte: new Date(startYear, 7, 15), // August 15
      lt: new Date(endYear, 6, 15), // July 15
    }
  }

  return whereBase
}
