/**
 * API Route: /api/users/[id]/curriculum
 * 
 * POST   - Sube un documento Word (.doc/.docx) como curriculum
 * GET    - Obtiene info y URL de descarga del curriculum
 * DELETE - Elimina el curriculum del usuario
 * 
 * Content-Type: multipart/form-data (para POST)
 * Field name: "curriculum"
 */

import { NextRequest, NextResponse } from 'next/server';
import { CurriculumUploadService, CurriculumUploadResult, CurriculumInfo } from '@/lib/upload/upload-service';

export const runtime = 'nodejs'; // Requerido para file system / buffers
export const maxDuration = 30; // Segundos para subidas grandes

/**
 * POST /api/users/[id]/curriculum
 * Sube un documento Word como curriculum del usuario
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
    const file = formData.get('curriculum') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió archivo. Campo esperado: "curriculum"' },
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
    const service = new CurriculumUploadService();
    const result = await service.uploadCurriculum(userId, file);

    if (!result.success) {
      const status = result.error?.includes('no encontrado') ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Curriculum subido correctamente',
      data: result.data,
    });
  } catch (error) {
    console.error('Error en POST /api/users/[id]/curriculum:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[id]/curriculum
 * Obtiene información y URL de descarga del curriculum
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const service = new CurriculumUploadService();
    const info = await service.getCurriculumInfo(userId);

    if (!info) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o sin curriculum' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error('Error en GET /api/users/[id]/curriculum:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/curriculum
 * Elimina el curriculum del usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const service = new CurriculumUploadService();
    const result = await service.deleteCurriculum(userId);

    if (!result.success) {
      const status = result.error?.includes('no encontrado') ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true, message: 'Curriculum eliminado' });
  } catch (error) {
    console.error('Error en DELETE /api/users/[id]/curriculum:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}