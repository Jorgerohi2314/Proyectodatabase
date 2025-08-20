import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Base de Datos de Usuarios',
    short_name: 'DB Users',
    description: 'Sistema de gestión de usuarios con Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#fefefe',
    theme_color: '#2F4F2F',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
