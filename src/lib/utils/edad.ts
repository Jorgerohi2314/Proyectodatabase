// Función para calcular la edad a partir de la fecha de nacimiento
export function calcularEdad(fechaNacimiento: Date | string): number {
  const fecha = new Date(fechaNacimiento)
  const hoy = new Date()
  
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