# 🚀 Actualizar la web en el servidor

Este documento explica cómo desplegar los cambios de la aplicación en el servidor (homelab).

La app usa **SQLite** como base de datos: un único archivo `prisma/production.db` que contiene
los datos reales (incluidos los currículums como BLOB). Ese archivo **nunca se sube al repo**
(contiene datos personales y está en `.gitignore`); se copia al servidor por `scp`/`rsync` y se
monta como volumen en el contenedor.

---

## 🧰 Qué hace falta por primera vez (sólo la primera vez)

En el servidor:

```bash
# Clonar el repositorio (una sola vez)
git clone <URL_DEL_REPOSITORIO> Proyectodatabase
cd Proyectodatabase

# Crear la carpeta donde vivirá la base de datos persistente
mkdir -p datos/web_gestion
```

---

## 📖 Parte 1 — Esta migración concreta (PostgreSQL → SQLite + BLOB)

> Caso único: no lo repitas como "actualización normal". Sirve para entender qué cambió y
> garantizar que el homelab queda con la BD SQLite correcta (`production.db`).

### Qué cambió respecto al despliegue anterior

| Antes | Después |
|---|---|
| PostgreSQL (servicio `db_gestion` externo) | SQLite en un archivo, sin Postgres |
| BD `prisma/dev.db` | BD renombrada a `prisma/production.db` |
| Datos en el repo / BD externa | Datos en `production.db`, copiada por scp, ignorada por git |
| Curriculum en el sistema de archivos | Curriculum como **BLOB** dentro de `production.db` |
| `prisma migrate deploy` en la imagen | `docker-entrypoint.js` crea el esquema si la BD está vacía |

### Pasos en este caso concreto

1. **En tu máquina local**, regenera y comprueba la BD SQLite de producción:

   ```bash
   npm run db:migrate-sqlite      # recrea prisma/production.db desde db-backups/*.sql
   # Opcional: verifica los recuentos (119 usuarios, etc.)
   ```

2. **Copia la BD y el código a GitHub** (no subas la BD):

   ```bash
   git add -A
   git commit -m "Migración a SQLite + producción.db"
   git push
   ```

   > La imagen Docker se construye desde el repo en el servidor. `production.db` queda fuera
   > porque está en `.gitignore` y en `.dockerignore`.

3. **En el servidor**, actualiza el código y prepara la carpeta de datos:

   ```bash
   cd Proyectodatabase
   git pull
   mkdir -p datos/web_gestion
   ```

4. **Copia la BD desde tu máquina al servidor**:

   ```bash
   # Desde tu máquina local
   scp prisma/production.db usuario@TU_HOMELAB:/ruta/Proyectodatabase/datos/web_gestion/production.db
   # o con rsync:
   rsync -avz prisma/production.db usuario@TU_HOMELAB:/ruta/Proyectodatabase/datos/web_gestion/production.db
   ```

   > ⚠️ El archivo `datos/web_gestion/production.db` **debe existir** antes del `docker compose up`
   > (si no, Docker crearía un directorio y fallaría). El `docker-entrypoint.js` crea las tablas
   > automáticamente si el archivo está vacío.

5. **Reconstruye y arranca** (sin Postgres):

   ```bash
   docker compose up -d --build
   ```

6. **Comprueba** que responde:

   ```bash
   curl http://TU_HOMELAB:3000/api/usuarios   # debe devolver un JSON con los usuarios
   ```

---

## 🔄 Parte 2 — Futuras actualizaciones (procedimiento normal)

Una vez que el servidor ya está funcionando en SQLite, aplicar cambios futuros es rápido:

### 1. En tu máquina local (desarrollar y probar)

```bash
npm run dev                # desarrollo local (usa prisma/production.db)
npm test                   # tests (recrea prisma/test.db sola)
```

Comprueba que compila:

```bash
npx tsc --noEmit
```

### 2. Subir el código a GitHub

```bash
git add -A
git commit -m "Descripción del cambio"
git push
```

> 🧠 Sólo sube **código**, nunca `prisma/production.db` (está en `.gitignore`).

### 3. Actualizar y reconstruir en el servidor

```bash
cd Proyectodatabase
git pull
docker compose up -d --build
```

### 4. Comprobar

```bash
docker compose ps                 # estado de los servicios
curl http://TU_HOMELAB:3000/api/usuarios
docker compose logs -f web_gestion   # ver logs en vivo
```

---

## ✅ Reglas de oro

- **Nunca** hagas `git push` con `prisma/production.db` o `.env` (contienen datos personales y secretos).
- La base de datos vive en `datos/web_gestion/production.db` del servidor y **no se pierde** al reconstruir la imagen.
- Si cambias el **esquema** de Prisma (`prisma/schema.prisma`), revisa si `prisma/sqlite-ddl.js` necesita
  su equivalente para la creación de tablas en el contenedor (el entrypoint crea las tablas sólo si la BD está vacía).
- Si necesitas **repoblar** datos en producción: regenera `production.db` en local
  (`npm run db:migrate-sqlite`), cópiala por scp y reinicia el contenedor:
  ```bash
  scp prisma/production.db usuario@TU_HOMELAB:/ruta/Proyectodatabase/datos/web_gestion/production.db
  docker compose restart web_gestion
  ```

---

## 🧪 Referencia rápida de comandos

| Comando | Cuándo |
|---|---|
| `npm run db:migrate-sqlite` | Regenerar `production.db` en local desde `db-backups/*.sql` |
| `npm run dev` | Arrancar desarrollo local |
| `npm test` | Tests (usa `prisma/test.db`) |
| `git push` | Subir el código (nunca la BD) |
| `git pull` | Actualizar el código en el servidor |
| `docker compose up -d --build` | Reconstruir y arrancar en el servidor |
| `scp prisma/production.db ...` | Copiar la BD al servidor |
| `docker compose logs -f web_gestion` | Ver logs en vivo |
