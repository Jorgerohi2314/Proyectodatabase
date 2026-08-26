# 1. Imagen base para dependencias
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Imagen para construir el proyecto (Builder)
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Desactiva la telemetría de Next.js para ahorrar recursos
ENV NEXT_TELEMETRY_DISABLED 1

# IMPORTANTE: Generar el cliente de Prisma antes del build
RUN npx prisma generate

# Construye la aplicación
RUN npm run build

# 3. Imagen final para producción (Runner) - La ligera
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo los archivos necesarios de la fase anterior
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Node_modules completo para tener el CLI de Prisma (migrate deploy al arrancar)
COPY --from=builder /app/node_modules ./node_modules
# Prisma schema + migrations para migrate deploy
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000
# Aplica las migraciones pendientes antes de arrancar (nunca destructivo)
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
