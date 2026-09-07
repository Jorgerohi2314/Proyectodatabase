# Guía de Actualización de la Web

Proyecto: **Andalucía Orienta — Proyectodatabase** (Next.js + Prisma + SQLite + Docker)

Esta guía explica **dos escenarios** para actualizar la aplicación cuando cambia el código:

- **Guía A — Cambio en la base de datos** (se añadió/eliminó una tabla, una columna o un índice en `prisma/schema.prisma`).
- **Guía B — Sin cambio en la base de datos** (solo se modificó código/página/lógica).

---

## 🧠 Idea clave antes de empezar

La app usa **SQLite** en un único archivo `prisma/production.db` que **contiene los datos reales** y
**no se sube a Git** (está en `.gitignore`). Al actualizar el código hay que decidir si el nuevo
esquema requiere tocar ese archivo.

> ⚠️ **Siempre, antes de hacer nada con la base de datos, haz una copia de seguridad:**
>
> ```bash
> # Desde la raíz del proyecto (local)
> copy prisma\production.db prisma\production_backup_<fecha>.db
> ```
>
> En el servidor, si la BD vive ahí:
> ```bash
> cp datos/web_gestion/production.db datos/web_gestion/production_backup_$(date +%Y%m%d).db
> ```

---

## 🔎 ¿Cómo sé si un cambio afecta a la base de datos?

Mira el diff del PR/commit. Si **solo cambiaron** ficheros como:

```
src/**            → componentes, páginas, rutas API, lógica
prisma/seed.ts    → datos de prueba (no altera el esquema)
```

entonces **no** afecta a la BD → sigue la **Guía B**.

Si **cambió** `prisma/schema.prisma` (o se creó/borró un `model {}`, un `enum`, una columna),
entonces **sí** afecta → sigue la **Guía A**.

> Regla práctica: `prisma/schema.prisma` es la **fuente de verdad** del esquema. Si ese archivo
> cambió, el esquema cambió.

---

## 🗂️ Dónde vive cada cosa

| Qué | Local (tu máquina) | Servidor (homelab, Docker) |
|---|---|---|
| Base de datos | `prisma/production.db` | bind-mount `datos/web_gestion/production.db` → `/app/prisma/production.db` |
| Esquema | `prisma/schema.prisma` | se copia dentro de la imagen al buildear |
| Cliente Prisma | se regenera con `npm run db:generate` | se regenera en el build (`prisma generate`) |
| Aplicación | `npm run dev` | imagen Docker |

> El `docker-entrypoint.js` del contenedor **crea tablas solo si faltan** (con DDL fijo en
> `prisma/sqlite-ddl.js`), pero **no añade tablas/columnas nuevas a una BD ya poblada**. Por eso,
> en el servidor, un cambio de esquema **siempre requiere ejecutar `npx prisma db push`** contra la
> BD persistente (no basta con `docker compose up --build`).

---

# ✅ GUÍA A — La base de datos CAMBIÓ

### 1) Local: prepara y valida el esquema

```bash
cd Proyectodatabase

# 1.1) (Recomendado) Backup antes de tocar nada
copy prisma\production.db prisma\production_backup_<fecha>.db

# 1.2) Aplica el esquema a tu BD local de desarrollo/producción local
npm run db:push          # = npx prisma db push

# 1.3) Regenera el cliente Prisma (si el build no lo hace solo)
npm run db:generate
```

> `db push` solo **añade** lo que falte y **no borra** columnas/tablas con datos (salvo que uses el
> flag `--accept-data-loss`). Si el prompt te pide confirmar un borrado de datos, **detente**.

### 2) Local: comprueba que todo funciona

```bash
npm run dev        # arranca la app con prisma/production.db
npm run build      # comprueba que compila
npm run lint       # comprueba el código (opcional)
```

Prueba manualmente las rutas/páginas nuevas (p. ej. `/progreso`) y verifica en la BD que la tabla
nueva existe:

```bash
npm run db:push    # si ya lo hiciste no hace falta; abrir la BD:
# con un cliente sqlite: SELECT name FROM sqlite_master WHERE type='table';
```

### 3) Sube el código a Git

```bash
git add src prisma/schema.prisma
git commit -m "feat: ..."
git push
```

> ⚠️ **No subas `prisma/production.db`** (sigue `.gitignore`). Solo se versiona el esquema y el código.

### 4) En el servidor: actualiza datos + esquema

La clave en SQLite/Docker es que el esquema hay que aplicarlo **contra la BD persistente del host**.

```bash
cd Proyectodatabase

# 4.1) (Recomendado) Backup de la BD en el servidor
cp datos/web_gestion/production.db datos/web_gestion/production_backup_$(date +%Y%m%d).db

# 4.2) Trae el código nuevo
git pull

# 4.3) Reconstruye la imagen (regenera cliente Prisma y copia el schema nuevo)
docker compose up -d --build
```

**Ahora, el paso imprescindible** — aplicar el esquema nuevo a la BD persistente. Hay dos formas:

**Opción A (recomendada): ejecuta `db push` dentro del contenedor ya construido:**

```bash
# Levanta el contenedor y luego, dentro de él, aplica el esquema
docker compose exec web_gestion npx prisma db push --skip-generate
docker compose restart web_gestion
```

**Opción B (alternativa): regenera la BD en local y cópiala (equivalente a re-desplegar):**

```bash
# Local
npm run db:push
scp prisma/production.db usuario@TU_HOMELAB:/ruta/Proyectodatabase/datos/web_gestion/production.db
docker compose restart web_gestion
```

> Si el esquema nuevo NO tiene datos que migrar (p. ej. solo una tabla nueva vacía como
> `vacation_days`), la **Opción A con `db push`** es la más limpia y no requiere copiar la BD.

### 5) Verifica en el servidor

Abre `http://TU_HOMELAB:3000` y comprueba que la funcionalidad nueva responde. Confirma la tabla:

```bash
docker compose exec web_gestion npx prisma db execute --stdin --schema prisma/schema.prisma \
  --url "file:/app/prisma/production.db"
# > SELECT name FROM sqlite_master WHERE type='table';
```

> Si usas volumen/bind-mount, la BD del host no cambia de ruta y no se pierde nada.

---

# ✅ GUÍA B — La base de datos NO cambió

Solo cambió código (componentes, páginas, lógica, `src/**`, `prisma/seed.ts`). No tocar la BD.

### 1) Local: comprueba que compila

```bash
cd Proyectodatabase
npm run dev        # o simplemente código nuevo en ejecución
npm run build      # opcional pero recomendado
```

### 2) Sube el código a Git

```bash
git add src ...
git commit -m "..."
git push
```

### 3) En el servidor: solo código

```bash
cd Proyectodatabase
git pull
docker compose up -d --build   # reconstruye la imagen con el código nuevo
```

> No hace falta `db push`, ni copiar la BD, ni restart por separado:
> la BD se conserva igual en el bind-mount.

### 4) Verifica

Recarga `http://TU_HOMELAB:3000` (puede requerir `Ctrl+F5` por caché del navegador).

---

## 🔁 Resumen rápido (decisiones)

| ¿Cambió `prisma/schema.prisma`? | Acción local | Acción servidor |
|---|---|---|
| **No** (solo código) | `npm run dev` / `build` | `git pull` + `docker compose up -d --build` |
| **Sí** (esquema nuevo) | backup + `npm run db:push` | backup + `git pull` + `up --build` + **`exec ... prisma db push`** + restart |

---

## 🚨 Solución de problemas

- **La tabla nueva no aparece en producción** → el `docker-entrypoint.js` solo crea tablas si faltan
  **todas las del DDL fijo**; no añade la tabla nueva a una BD ya existente. Ejecuta manualmente el
  paso 4.3/4.4 de la **Guía A** (`npx prisma db push`).
- **`db push` te pide perder datos** → aborta. Revisa el cambio de esquema; un borrado de datos debe
  aprobarse y quedar documentado.
- **La web dice que la tabla no existe** (`no such table: vacation_days`) → es que el esquema no se
  ha aplicado; vuelve a la **Guía A**, paso 4.
- **Mi BD local se corrompió** → restaura del backup: `copy prisma\production_backup_<fecha>.db prisma\production.db`

---

## 📦 Referencias del proyecto

- `prisma/schema.prisma` — esquema (fuente de verdad)
- `prisma/sqlite-ddl.js` / `scripts/sqlite-ddl.ts` — DDL de arranque del contenedor (solo tablas básicas)
- `docker-entrypoint.js` — inicializa la BD al arrancar el contenedor
- `docker-compose.yml` — bind-mount de `production.db`
- `DEPLOY.md` — guía completa de despliegue (contexto Docker/SQLite)
- Scripts útiles en `package.json`: `db:push`, `db:generate`, `db:migrate`, `db:reset`, `db:seed`
