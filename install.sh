#!/bin/bash

# Script de instalación automática para el proyecto de Gestión de Usuarios

echo "🚀 Iniciando instalación del proyecto de Gestión de Usuarios"
echo "========================================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js 18+ y vuelve a intentarlo."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instala npm y vuelve a intentarlo."
    exit 1
fi

# Mostrar versiones
echo "📋 Versiones instaladas:"
echo "   Node.js: $(node -v)"
echo "   npm: $(npm -v)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias de Node.js..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar las dependencias."
    exit 1
fi

echo "✅ Dependencias instaladas correctamente."

# Generar cliente de Prisma
echo "🗄️  Generando cliente de Prisma..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Error al generar el cliente de Prisma."
    exit 1
fi

echo "✅ Cliente de Prisma generado correctamente."

# Sincronizar base de datos
echo "🔄 Sincronizando esquema de base de datos..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Error al sincronizar la base de datos."
    exit 1
fi

echo "✅ Base de datos sincronizada correctamente."

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "⚙️  Creando archivo de configuración .env..."
    cat > .env << EOF
# Database
DATABASE_URL="file:./production.db"

# Next.js
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Port (opcional)
PORT=3000
EOF
    echo "✅ Archivo .env creado correctamente."
else
    echo "ℹ️  El archivo .env ya existe. No se modificará."
fi

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error al construir la aplicación."
    exit 1
fi

echo "✅ Aplicación construida correctamente."

echo ""
echo "🎉 ¡Instalación completada con éxito!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Revisa el archivo .env y ajusta las variables si es necesario"
echo "   2. Inicia la aplicación con: npm start"
echo "   3. Abre tu navegador en: http://localhost:3000"
echo ""
echo "🔧 Para producción considera usar PM2:"
echo "   npm install -g pm2"
echo "   pm2 start server.ts --name 'gestion-usuarios'"
echo ""
echo "📚 Consulta el archivo DEPLOY.md para más información de despliegue."