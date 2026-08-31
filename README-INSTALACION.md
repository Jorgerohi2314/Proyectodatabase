# 🚀 Instalación Rápida - Gestión de Usuarios

## 📦 Descarga del Proyecto

El proyecto está listo para descargar en el archivo: **`gestion-usuarios.tar.gz`**

## ⚡ Instalación Automática (Recomendado)

### 1. Descomprimir el proyecto
```bash
tar -xzf gestion-usuarios.tar.gz
cd gestion-usuarios
```

### 2. Ejecutar el script de instalación
```bash
bash install.sh
```

### 3. Iniciar la aplicación
```bash
npm start
```

### 4. Abrir en el navegador
Visita: http://localhost:3000

## 🔧 Instalación Manual

### 1. Descomprimir y entrar al directorio
```bash
tar -xzf gestion-usuarios.tar.gz
cd gestion-usuarios
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos
```bash
npm run db:generate
npm run db:push
```

### 4. Construir la aplicación
```bash
npm run build
```

### 5. Iniciar en producción
```bash
npm start
```

## 🌐 Acceso a la Aplicación

- **URL:** http://localhost:3000
- **Puerto por defecto:** 3000
- **Base de datos:** SQLite (archivo `production.db`)

## 📝 Configuración Básica

El archivo `.env` se crea automáticamente con la configuración básica. Puedes editarlo para personalizar:

```env
DATABASE_URL="file:./production.db"
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
PORT=3000
```

## 🔄 Para Producción

### Usando PM2 (Recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start server.ts --name "gestion-usuarios"

# Ver estado
pm2 status

# Ver logs
pm2 logs gestion-usuarios
```

### Cambiar puerto
Edita el archivo `.env`:
```env
PORT=3001
```

## 🎯 Funcionalidades Principales

- ✅ Gestión completa de usuarios
- ✅ Tres apartados de información
- ✅ Búsqueda avanzada
- ✅ Generación de PDFs
- ✅ Interfaz responsive
- ✅ Formularios validados

## 🚨 Solución de Problemas

### "Comando no encontrado"
Asegúrate de tener Node.js 18+ instalado.

### "Permiso denegado"
```bash
chmod +x install.sh
```

### "Puerto en uso"
Cambia el puerto en `.env`:
```env
PORT=3001
```

### "Error de base de datos"
```bash
npm run db:push
```

## 📚 Documentación Completa

Para más detalles, consulta el archivo `DEPLOY.md` que incluye:
- Configuración de Nginx
- Configuración SSL/HTTPS
- Monitoreo con PM2
- Actualizaciones
- Solución de problemas avanzados

---

🎉 **¡Listo para usar!** El proyecto estará funcionando en http://localhost:3000