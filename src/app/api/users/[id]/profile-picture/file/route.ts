/**
 * API Route: /api/users/[id]/profile-picture/file
 * 
 * GET - Sirve el archivo de foto de perfil directamente desde la BD (BLOB)
 * 
 * Respuesta: archivo binario con Content-Type apropiado
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfilePictureUploadService } from '@/lib/upload/profile-picture-service';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const service = new ProfilePictureUploadService();
    const fileData = await service.getProfilePictureFile(userId);

    if (!fileData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o sin foto de perfil' },
        { status: 404 }
      );
    }

    // Servir el archivo directamente.
    // Cache-Control "no-cache" (no "immutable") para que al reemplazar la foto
    // el navegador revalide y no sirva la imagen anterior cacheada.
    return new NextResponse(new Uint8Array(fileData.buffer), {
      headers: {
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileData.fileName)}"`,
        'Cache-Control': 'private, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error en GET /api/users/[id]/profile-picture/file:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}