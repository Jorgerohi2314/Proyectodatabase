# Roadmap de Despliegue: Actualización a PostgreSQL y Nuevas Funcionalidades

Esta guía contiene todos los pasos necesarios para actualizar tu aplicación, desde la preparación de tu entorno local hasta el despliegue final en el servidor de producción.

**Contexto:** Tu entorno de desarrollo usaba SQLite, pero producción usa PostgreSQL. Este plan alinea ambos, genera los artefactos correctos y te guía en un despliegue seguro que preserva tus datos.

---

## Fase 1: Finalizar Preparación en tu Entorno Local

**Objetivo:** Generar los archivos de migración de PostgreSQL que yo no pude crear.

### 1.1. Inicia tu Base de Datos Local
Asegúrate de que tu contenedor Docker de PostgreSQL esté corriendo. Si usas el `docker-compose.yml` que me compartiste, ejecuta:
```bash
docker-compose up -d db_gestion
```

### 1.2. Configura tu Archivo `.env` Local
Tu archivo `.env` actual apunta a SQLite. Modifícalo **temporalmente** para que apunte a tu base de datos Docker local.
```env
# DATABASE_URL="file:./dev.db" # Comenta o elimina esta línea
DATABASE_URL="postgresql://usuario_db:141414@localhost:5432/gestion_clientes"

# ... resto de tus variables ...
```

### 1.3. Genera las Migraciones de PostgreSQL
Este es el paso más importante. Con la base de datos corriendo y el `.env` configurado, ejecuta:
```bash
npx prisma migrate dev --name init_postgres_con_features
```
*   **¿Qué hace esto?** Prisma se conectará a tu base de datos local (que debería estar vacía o ser de prueba), verá que no tiene ninguna tabla, y creará una **única migración inicial** en la nueva carpeta `prisma/migrations/` que contiene todo el esquema de la aplicación (usuarios, diario, etc.) en el formato correcto para PostgreSQL.
*   **¡No te preocupes!** Esto no afectará a tu base de datos de producción. Solo estamos usando la base de datos local para generar los archivos SQL correctos.

### 1.4. Revierte tu `.env`
Una vez que el comando anterior termine y tengas la nueva carpeta de migraciones, puedes devolver tu archivo `.env` a su estado original si lo deseas (apuntando a `file:./dev.db`) para seguir desarrollando en SQLite si así lo prefieres.

---

## Fase 2: Subir Todo a GitHub

**Objetivo:** Actualizar tu repositorio con el código final y las nuevas migraciones de PostgreSQL.

### 2.1. Verifica los Cambios
Revisa los archivos que se van a subir. Deberías ver:
*   `prisma/schema.prisma` (con `provider = "postgresql"`)
*   La nueva carpeta `prisma/migrations/` con la migración `..._init_postgres_con_features`.
*   Todos los cambios en la UI y API que implementé (`user-form.tsx`, `user-detail-view.tsx`, etc.).

### 2.2. Commit y Push
```bash
# Añade todos los cambios
git add .

# Crea un commit claro y descriptivo
git commit -m "feat: Add user source and diary features, align with PostgreSQL"

# Sube los cambios a tu repositorio
git push origin main
```

---

## Fase 3: Despliegue en el Servidor de Producción

**Objetivo:** Actualizar la aplicación en tu servidor de forma segura, aplicando los cambios y preservando los datos.

### 3.1. Backup (¡Obligatorio!)
Conéctate a tu servidor y haz una copia de seguridad de la base de datos de producción.
```bash
# Reemplaza los valores si son diferentes
docker exec -t db_gestion pg_dump -U usuario_db -Fc gestion_clientes > /tmp/backup_prod_$(date +%Y%m%d).dump
```
Si tienes archivos de currículums, haz también una copia de la carpeta de `uploads` por si acaso (el siguiente paso la hará persistente).

### 3.2. Actualiza el `docker-compose.yml`
Edita el `docker-compose.yml` en tu servidor para añadir un **volumen persistente** para los uploads. Esto es crucial para no perder los currículums.

```yaml
services:
  db_gestion:
    # ... sin cambios ...

  web_gestion:
    build: ./Proyectodatabase
    container_name: web_gestion
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://usuario_db:141414@db_gestion:5432/gestion_clientes"
    volumes: # <-- AÑADE ESTA LÍNEA Y LA SIGUIENTE
      - ./datos/uploads:/app/public/uploads
    depends_on:
      - db_gestion
```
Antes de continuar, crea el directorio local si no existe: `mkdir -p ./datos/uploads`.

### 3.3. Obtén el Código y Reconstruye la Imagen
```bash
# En la carpeta donde está tu docker-compose.yml
cd /ruta/a/tu/proyecto

# Descarga los últimos cambios de GitHub
git pull origin main

# Reconstruye la imagen de tu aplicación con los nuevos cambios
docker-compose build --no-cache web_gestion
```

### 3.4. Aplica las Migraciones a la Base de Datos de Producción
Este es el comando seguro que actualiza el esquema de tu base de datos sin perder datos.
```bash
docker-compose run --rm web_gestion npx prisma migrate deploy
```
*   **¿Qué hará?** Prisma comparará las migraciones en tu carpeta `prisma/migrations/` con una tabla especial en tu base de datos (`_prisma_migrations`). Detectará que la nueva migración `..._init_postgres_con_features` no se ha aplicado.
*   **¿Es seguro?** Sí. Como tu base de datos de producción ya tiene tablas que coinciden con una parte del esquema, `migrate deploy` **no intentará recrearlas**. Solo aplicará los cambios aditivos:
    *   `ADD COLUMN "source"` a `user_profiles` (y rellenará con `'PROPIO'` por defecto).
    *   `CREATE TABLE "diary_entries"`.
    *   No borrará ningún dato existente.

### 3.5. Reinicia la Aplicación
```bash
# --force-recreate es importante para que use la nueva imagen y la nueva configuración de volúmenes
docker-compose up -d --force-recreate web_gestion
```

### 3.6. Verifica los Logs y la Aplicación
```bash
docker-compose logs -f web_gestion
```
Revisa que no haya errores de conexión a la base de datos o de arranque. Luego, accede a la aplicación en tu navegador y prueba las nuevas funcionalidades.

---

## Fase 4: Rollback (Plan de Contingencia)

Si algo sale catastróficamente mal, puedes volver al estado anterior:

1.  **Revertir el código:** `git revert HEAD` en el servidor.
2.  **Reconstruir la imagen antigua:** `docker-compose build --no-cache web_gestion`.
3.  **Restaurar la base de datos:** Usa `pg_restore` con el archivo de backup que creaste.
4.  **Reiniciar:** `docker-compose up -d --force-recreate web_gestion`.

Siguiendo estos pasos, el proceso de actualización será robusto y seguro.