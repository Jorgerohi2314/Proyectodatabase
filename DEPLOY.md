# Guía de Despliegue del Proyecto de Gestión de Usuarios

## 📋 Requisitos del Servidor

Antes de desplegar, asegúrate de que tu servidor tenga instalados:
- Node.js (v18 o superior)
- npm o yarn
- SQLite3 (incluido en el proyecto)

## 📦 Opción 1: Descarga Directa (Recomendada)

### 1. Comprimir el proyecto
```bash
# Desde la raíz del proyecto
cd /home/z/my-project
tar -czf gestion-usuarios.tar.gz --exclude='node_modules' --exclude='.git' --exclude='*.log' .
```

### 2. Descargar el archivo comprimido
El archivo `gestion-usuarios.tar.gz` contendrá todo el proyecto listo para desplegar.

## 🚀 Opción 2: Usar Git (Si tienes acceso SSH)

### 1. Clonar el proyecto
```bash
git clone <URL_DEL_REPOSITORIO>
cd gestion-usuarios
```

### 2. Instalar dependencias
```bash
npm install
```

## ⚙️ Configuración del Servidor

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://tu-dominio.com"

# Port (opcional)
PORT=3000
```

### 2. Configurar la Base de Datos
```bash
# Generar cliente de Prisma
npm run db:generate

# Sincronizar esquema con la base de datos
npm run db:push
```

## 🏃‍♂️ Ejecución en Producción

### Opción A: Desarrollo (Para pruebas)
```bash
npm run dev
```

### Opción B: Producción (Recomendado)
```bash
# Construir la aplicación
npm run build

# Iniciar en modo producción
npm start
```

### Opción C: Usando PM2 (Para producción robusta)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start server.ts --name "gestion-usuarios"

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar en el boot
pm2 startup
```

## 🌐 Configuración de Nginx (Opcional pero recomendado)

Si usas Nginx como proxy inverso, crea un archivo de configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Configuración de SSL/HTTPS (Opcional)

```bash
# Usar Certbot para SSL gratuito
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## 📂 Estructura del Proyecto

```
gestion-usuarios/
├── src/
│   ├── app/                 # Páginas y API routes
│   ├── components/          # Componentes React
│   ├── hooks/              # Hooks personalizados
│   └── lib/                # Utilidades y configuración
├── prisma/                 # Esquema de base de datos
├── public/                 # Archivos estáticos
├── package.json           # Dependencias del proyecto
├── next.config.ts         # Configuración de Next.js
├── tailwind.config.ts     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
├── server.ts              # Archivo de entrada del servidor
└── .env                   # Variables de entorno (crear)
```

## 🚨 Notas Importantes

1. **Base de Datos:** El proyecto usa SQLite, que crea un archivo `dev.db` en la raíz
2. **Puerto:** Por defecto usa el puerto 3000
3. **Archivos Temporales:** Los logs se generan en `dev.log` y `server.log`
4. **Permisos:** Asegúrate de que el usuario del servidor tenga permisos de escritura

## 🔍 Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Database not found"
```bash
npm run db:push
```

### Error: "Port already in use"
```bash
# Cambiar el puerto en el .env
PORT=3001
```

### Error: "Permission denied"
```bash
# Dar permisos al directorio
chmod -R 755 /ruta/al/proyecto
```

## 📊 Monitoreo

### Verificar que la aplicación está corriendo
```bash
pm2 status
```

### Ver logs en tiempo real
```bash
pm2 logs gestion-usuarios
```

### Reiniciar la aplicación
```bash
pm2 restart gestion-usuarios
```

## 🔄 Actualizaciones

Para actualizar el proyecto en el futuro:
```bash
# 1. Descargar la nueva versión
# 2. Detener la aplicación
pm2 stop gestion-usuarios

# 3. Extraer los nuevos archivos
# 4. Instalar dependencias
npm install

# 5. Actualizar base de datos si es necesario
npm run db:push

# 6. Reconstruir la aplicación
npm run build

# 7. Iniciar nuevamente
pm2 start gestion-usuarios
```

## 📞 Soporte

Si encuentras algún problema durante el despliegue, verifica:
1. Los requisitos del servidor
2. Las variables de entorno
3. Los permisos de los archivos
4. Los logs de error en `pm2 logs`