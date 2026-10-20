/**
 * API Route: /api/users/[id]/profile-picture
 * 
 * POST   - Sube una imagen (jpg, png, webp, gif) como foto de perfil
 * GET    - Obtiene metadatos de la foto de perfil (los bytes se sirven en /file)
 * DELETE - Elimina la foto de perfil del usuario
 * 
 * Content-Type: multipart/form-data (para POST)
 * Field name: "profilePicture"
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfilePictureUploadService, ProfilePictureUploadResult, ProfilePictureInfo } from '@/lib/upload/profile-picture-service';

export const runtime = 'nodejs'; // Requerido para file system / buffers
export const maxDuration = 30; // Segundos para subidas grandes

/**
 * POST /api/users/[id]/profile-picture
 * Sube una imagen como foto de perfil del usuario
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Verificar Content-Type multipart
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type debe ser multipart/form-data' },
        { status: 400 }
      );
    }

    // Parsear FormData
    const formData = await request.formData();
    const file = formData.get('profilePicture') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió archivo. Campo esperado: "profilePicture"' },
        { status: 400 }
      );
    }

    // Validar que es un File (no string)
    if (typeof file === 'string') {
      return NextResponse.json(
        { error: 'Datos inválidos: se esperaba un archivo' },
        { status: 400 }
      );
    }

    // Instanciar servicio y subir
    const service = new ProfilePictureUploadService();
    const result = await service.uploadProfilePicture(userId, file);

    if (!result.success) {
      const status = result.error?.includes('no encontrado') ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Foto de perfil subida correctamente',
      data: result.data,
    });
  } catch (error) {
    console.error('Error en POST /api/users/[id]/profile-picture:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[id]/profile-picture
 * Obtiene información y URL de descarga de la foto de perfil
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const service = new ProfilePictureUploadService();
    const info = await service.getProfilePictureInfo(userId);

    if (!info) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o sin foto de perfil' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error('Error en GET /api/users/[id]/profile-picture:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/profile-picture
 * Elimina la foto de perfil del usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const service = new ProfilePictureUploadService();
    const result = await service.deleteProfilePicture(userId);

    if (!result.success) {
      const status = result.error?.includes('no encontrado') ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true, message: 'Foto de perfil eliminada' });
  } catch (error) {
    console.error('Error en DELETE /api/users/[id]/profile-picture:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}