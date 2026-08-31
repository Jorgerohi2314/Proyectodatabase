/**
 * API Route: /api/users/[id]/curriculum/file
 *
 * GET - Sirve los bytes del curriculum almacenado en BD (BLOB)
 *       ?download=1 -> fuerza descarga (Content-Disposition: attachment)
 *       sin parámetro -> visualización inline (Content-Disposition: inline)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CurriculumUploadService } from '@/lib/upload/upload-service';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const service = new CurriculumUploadService();
    const fileData = await service.getCurriculumFile(userId);

    if (!fileData) {
      return NextResponse.json(
        { error: 'Usuario sin curriculum' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const download = searchParams.get('download') === '1';
    const disposition = download ? 'attachment' : 'inline';
    const safeFileName = fileData.fileName.replace(/["\\\r\n]/g, '_');

    return new NextResponse(fileData.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': fileData.mimeType,
        'Content-Length': String(fileData.buffer.length),
        'Content-Disposition': `${disposition}; filename="${safeFileName}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error en GET /api/users/[id]/curriculum/file:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}