// Función para calcular la edad a partir de la fecha de nacimiento
export function calcularEdad(fechaNacimiento: Date | string): number {
  const hoy = new Date()

  // Parseo seguro para cadenas "YYYY-MM-DD" evitando desfases por zona horaria
  let fecha: Date
  if (typeof fechaNacimiento === 'string') {
    const isoLocalMatch = fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/)
    if (isoLocalMatch) {
      const [year, month, day] = fechaNacimiento.split('-').map(Number)
      fecha = new Date(year, month - 1, day)
    } else {
      fecha = new Date(fechaNacimiento)
    }
  } else {
    fecha = new Date(fechaNacimiento)
  }

  if (isNaN(fecha.getTime())) return 0

  let edad = hoy.getFullYear() - fecha.getFullYear()
  const mesDiferencia = hoy.getMonth() - fecha.getMonth()

  if (mesDiferencia < 0 || (mesDiferencia === 0 && hoy.getDate() < fecha.getDate())) {
    edad--
  }

  return edad
}

// Función para formatear la fecha
export function formatearFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}