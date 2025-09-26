// server.ts - Next.js Standalone + Socket.IO + Prisma REST test
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = process.env.PORT || 3000;
const hostname = '0.0.0.0';

// Creamos cliente Prisma
const prisma = new PrismaClient();

// Custom server with Socket.IO + Express + Prisma
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({
      dev,
      dir: process.cwd(),
      conf: dev ? undefined : { distDir: './.next' }
    });
    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Creamos Express app
    const expressApp = express();
    expressApp.use(express.json());

    // ✅ Endpoints de API personalizados (antes que Next.js)
    expressApp.get('/api/usuarios', async (req: Request, res: Response) => {
      try {
        const usuarios = await prisma.userProfile.findMany();
        res.json(usuarios);
      } catch (err) {
        res.status(500).json({ error: 'Error obteniendo usuarios', details: err });
      }
    });

    expressApp.post('/api/usuarios', async (req: Request, res: Response) => {
      try {
        const nuevo = await prisma.userProfile.create({
          data: {
            nombre: req.body.nombre,
            email: req.body.email
          }
        });
        res.json(nuevo);
      } catch (err) {
        res.status(500).json({ error: 'Error creando usuario', details: err });
      }
    });

    // Create HTTP server PRIMERO
    const server = createServer();

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // ✅ Manejo manual de requests
    server.on('request', async (req, res) => {
      try {
        // Si es Socket.IO, no hacer nada (ya se maneja automáticamente)
        if (req.url?.startsWith('/api/socketio')) {
          return;
        }

        // Si es nuestra API personalizada, usar Express
        if (req.url?.startsWith('/api/usuarios')) {
          return expressApp(req, res);
        }

        // Todo lo demás va a Next.js
        return handle(req, res);
      } catch (err) {
        console.error('Request handling error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Start the server
    server.listen(Number(currentPort), hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();