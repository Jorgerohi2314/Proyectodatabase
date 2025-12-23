/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ESTA ES LA LÍNEA MÁGICA PARA DOCKER
  output: 'standalone',

  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },

  // He mantenido tus configuraciones de ignorar errores
  eslint: {
    ignoreDuringBuilds: true,
  },

  reactStrictMode: false,

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ['**/*'],
      };
    }
    return config;
  },
};

export default nextConfig;