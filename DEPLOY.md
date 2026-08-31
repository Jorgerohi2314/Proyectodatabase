# Guía de Despliegue (SQLite + Docker)

Este proyecto usa **SQLite** (un único archivo `prisma/production.db`) y se despliega en Docker.
Al no subir la base de datos al repositorio (contiene datos personales: nombre, DNI, direcciones),
los datos se copian al servidor por `scp`/`rsync` y se montan como volumen.

## 🗂️ Estructura de datos

| Archivo | Descripción |
|---|---|
| `prisma/production.db` | Base de datos con los datos reales (la que se despliega y usas en producción). |
| `prisma/test.db` | Base de datos de tests (se recrea sola con `npm test`). |
| `prisma/schema.prisma` | Esquema (fuente de verdad). |
| `prisma/sqlite-ddl.js` | DDL en JS: crea el esquema en el contenedor si la BD está vacía. |
| `scripts/migrate-pg-to-sqlite.ts` | Recrea `production.db` desde `db-backups/*.sql`. |
| `docker-entrypoint.js` | Entrada del contenedor: crea el esquema si falta y arranca la app. |

## 🚀 Despliegue en el homelab

### 1. Subir la aplicación (código) a GitHub
La imagen Docker se construye desde el repo. **No subas `prisma/production.db`** (ya está en `.gitignore`).
Solo se versiona el código y el esquema.

### 2. En el servidor (homelab): clonar y preparar datos

```bash
git clone <URL_DEL_REPOSITORIO> Proyectodatabase
cd Proyectodatabase

# Crear la carpeta donde vivirá la base de datos persistente
mkdir -p datos/web_gestion
```

### 3. Copiar la base de datos con los 119 usuarios (desde tu máquina)

```bash
# Desde tu máquina local (donde está prisma/production.db con los datos)
scp prisma/production.db usuario@TU_HOMELAB:/ruta/Proyectodatabase/datos/web_gestion/production.db
# o con rsync:
rsync -avz prisma/production.db usuario@TU_HOMELAB:/ruta/Proyectodatabase/datos/web_gestion/production.db
```

> Importante: el archivo `datos/web_gestion/production.db` debe existir antes del `docker compose up`.
> Si el bind-mount no encuentra el archivo, Docker crearía un directorio y fallaría.
> El `docker-entrypoint.js` crea las tablas automáticamente si el archivo está vacío.

### 4. Construir y arrancar

```bash
docker compose up -d --build
```

La app queda en `http://TU_HOMELAB:3000`.

## ⚙️ Variables de entorno (contenedor)

El `docker-compose.yml` define:

```yaml
- DATABASE_URL=file:/app/prisma/production.db   # Ruta absoluta dentro del contenedor
volumes:
  - ./datos/web_gestion/production.db:/app/prisma/production.db   # BD persistente del host
```

Puedes añadir más variables al bloque `environment:` del `docker-compose.yml`.

## 🔄 Actualizar la aplicación

```bash
cd Proyectodatabase
git pull
docker compose up -d --build
```

La base de datos **no se pierde**: vive en `datos/web_gestion/production.db` del host, fuera de la imagen.

## 🔄 Actualizar los datos (si cambia el dump)

Si quieres repoblar la BD desde el volcado SQL, ejecútalo en tu máquina local y vuelve a copiar:

```bash
# Local (regenera prisma/production.db con los datos del backup)
npm run db:migrate-sqlite

# Luego copiar de nuevo al servidor
scp prisma/production.db usuario@TU_HOMELAB:/ruta/Proyectodatabase/datos/web_gestion/production.db
docker compose restart web_gestion
```

## 🔧 Notas

- La web no depende de PostgreSQL: el servicio `db_gestion` del compose original ya **no se usa**.
- Los curriculum ahora se guardan como BLOB dentro de `production.db`, así que no hace falta volumen de `uploads`.
- Si tu homelab ya tiene un volumen con una BD SQLite previa, monta esa ruta en vez de `datos/web_gestion/production.db`.

## 🧪 Desarrollo local

```bash
npm install
npm run dev        # usa prisma/production.db local
npm test           # usa prisma/test.db (se recrea sola)
npm run db:migrate-sqlite  # regenera production.db desde db-backups/*.sql
```
