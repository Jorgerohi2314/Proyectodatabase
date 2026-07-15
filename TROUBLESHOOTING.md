# Troubleshooting Log for Project Build and Dependency Issues

This document outlines a series of critical environment and dependency issues encountered while attempting to build and run the project.

## 1. Core Problem: `npm install` Fails with "Invalid Version"

The primary blocker is that `npm install` consistently fails, preventing any dependencies from being installed.

### Symptoms
- Running `npm install` (with no arguments) on a clean checkout fails immediately.
- The error message is consistently `npm error Invalid Version:`.
- The error log does not provide specific details about which package or version is invalid.
- This failure occurs even when attempting to install a single, known-valid package like `npm install core-js`.

### Steps Taken to Resolve
The following steps were taken in an attempt to fix the `npm install` failure, none of which were successful:

1.  **Delete `node_modules` and `package-lock.json`**: A full clean of dependencies was performed using `rd /s /q node_modules` and `del package-lock.json`. The subsequent `npm install` failed with the same error.
2.  **Clear `npm` Cache**: The `npm` cache was forcefully cleared using `npm cache clean --force`. The subsequent `npm install` failed.
3.  **Check for `.npmrc`**: A search for a project-specific `.npmrc` file was performed. None was found. This suggests the issue is likely not a project-level configuration override.

### Root Cause Found & Fixed

**Causa raíz:** El paquete `tailwindcss-animate@1.0.7` declaraba en su `peerDependencies` el rango `">=3.0.0 || insiders"`. El comparador `"insiders"` no es un comparador semver válido. npm 11.13 lo rechaza estrictamente en `semver.Range`, lanzando `Invalid Version:` (vacío) durante el paso `canDedupe` en arborist.

**Solución:** Se eliminó `tailwindcss-animate` del `package.json` (no se usaba en el código fuente — 0 imports). El proyecto ya incluye `tw-animate-css` en `devDependencies`, que es el sucesor oficial compatible con Tailwind CSS v4.

**Pasos ejecutados:**
1. Eliminar `"tailwindcss-animate": "^1.0.7"` de `dependencies` en `package.json`
2. Eliminar `package-lock.json` corrupto
3. Ejecutar `npm install` → genera nuevo lock limpio (929 paquetes)
4. Verificar `npm ci` → funciona correctamente
5. Verificar `npx prisma generate` → Prisma Client generado sin errores
6. Verificar `npm run build` → build exitoso (12 páginas, sin errores)

**Estado:** ✅ Proyecto completamente funcional.

---

## 2. Build Failures (Symptoms of the Core Problem)

Before the `npm install` issue became the primary blocker, several build failures occurred, all pointing back to an incomplete or corrupted `node_modules` directory. These are logged here for completeness.

### A. Missing `core-js` Dependency

- **Command:** `npm run build`
- **Error:** `Module not found: Can't resolve 'core-js/modules/...'`
- **Root Cause:** The dependency `jspdf` -> `canvg` requires `core-js`, which was not installed. Attempts to install it manually (`npm install core-js`) triggered the "Invalid Version" error described above.
- **Workaround Attempted:** Temporarily disabling the API route that uses `jspdf` (`src/app/api/users/[id]/pdf/route.ts`) to see if the rest of the project would build.

### B. Missing Prisma Client

- **Command:** `npm run build` (after disabling the PDF route)
- **Error:** `Cannot find module '.prisma/client/default'`
- **Root Cause:** The Prisma client was not generated after a partial `npm install`. The `node_modules` directory was missing the required files.

### C. Missing Prisma Internal Dependency (`jiti`)

- **Command:** `npx prisma generate`
- **Error:** `Cannot find module 'jiti'`
- **Root Cause:** A clear indication that the `prisma` package itself within `node_modules` was corrupted and missing its own internal dependencies.

---

## Resultado Final

**✅ Proyecto completamente funcional.** La causa raíz era el peerDependency inválido `">=3.0.0 || insiders"` en `tailwindcss-animate@1.0.7`, no un problema del entorno npm/node. Se eliminó la dependencia (no utilizada) y se regeneró el lock. Todos los comandos (`npm install`, `npm ci`, `prisma generate`, `next build`) funcionan correctamente.
