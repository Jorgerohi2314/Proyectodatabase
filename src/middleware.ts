import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas públicas (no requieren autenticación)
  const publicRoutes = ['/login']
  
  // Si es una ruta pública, permitir acceso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  
  // Si no es una ruta pública, verificar autenticación
  // Como la autenticación se maneja en el cliente, solo redirigimos si es la primera carga
  // El contexto de autenticación se encargará de verificar el estado real
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
