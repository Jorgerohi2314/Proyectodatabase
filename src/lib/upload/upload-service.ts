/**
 * Servicio de orquestación para subida de curriculum.
 * El documento se almacena directamente en la BD (columna BLOB) para simplificar
 * el despliegue en producción: un único archivo (production.db) contiene datos y ficheros,
 * sin depender de rutas de filesystem, URLs base ni almacenamiento externo.
 */

import { db } from '@/lib/db';
import { validateDocument } from './validation';

export interface CurriculumUploadResult {
  success: boolean;
  data?: {
    url: string;
    fileName: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}

export interface CurriculumInfo {
  url: string;
  fileName: string;
  size: number | null;
  mimeType: string | null;
  uploadedAt: Date | null;
}

export interface CurriculumFileData {
  buffer: Uint8Array;
  fileName: string;
  mimeType: string;
}

/**
 * Servicio para gestión completa de curriculum
 */
export class CurriculumUploadService {
  /**
   * Sube un curriculum, valida, almacena en BD y actualiza el perfil
   */
  async uploadCurriculum(
    userId: string,
    file: File
  ): Promise<CurriculumUploadResult> {
    // 1. Validar archivo
    const validation = await validateDocument(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 2. Verificar que el usuario existe
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // 3. Convertir File a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Guardar en BD (sobrescribe el curriculum anterior si existía)
    await db.userProfile.update({
      where: { id: userId },
      data: {
        curriculumFile: buffer,
        curriculumFileName: file.name,
        curriculumMimeType: validation.mimeType ?? 'application/octet-stream',
        curriculumSize: buffer.length,
      },
    });

    return {
      success: true,
      data: {
        url: `/api/users/${userId}/curriculum/file`,
        fileName: file.name,
        size: buffer.length,
        mimeType: validation.mimeType ?? 'application/octet-stream',
      },
    };
  }

  /**
   * Elimina el curriculum de un usuario (solo BD)
   */
  async deleteCurriculum(userId: string): Promise<CurriculumUploadResult> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: { curriculumFileName: true },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (!user.curriculumFileName) {
      return { success: false, error: 'El usuario no tiene curriculum subido' };
    }

    await db.userProfile.update({
      where: { id: userId },
      data: {
        curriculumFile: null,
        curriculumFileName: null,
        curriculumMimeType: null,
        curriculumSize: null,
      },
    });

    return { success: true };
  }

  /**
   * Obtiene información del curriculum almacenado
   */
  async getCurriculumInfo(userId: string): Promise<CurriculumInfo | null> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: {
        curriculumFileName: true,
        curriculumSize: true,
        curriculumMimeType: true,
        updatedAt: true,
      },
    });

    if (!user?.curriculumFileName) return null;

    return {
      url: `/api/users/${userId}/curriculum/file`,
      fileName: user.curriculumFileName,
      size: user.curriculumSize,
      mimeType: user.curriculumMimeType,
      uploadedAt: user.updatedAt,
    };
  }

  /**
   * Obtiene los bytes del curriculum para servirlo por HTTP
   */
  async getCurriculumFile(userId: string): Promise<CurriculumFileData | null> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: {
        curriculumFile: true,
        curriculumFileName: true,
        curriculumMimeType: true,
      },
    });

    if (!user?.curriculumFile) return null;

    return {
      buffer: user.curriculumFile,
      fileName: user.curriculumFileName ?? 'curriculum',
      mimeType: user.curriculumMimeType ?? 'application/octet-stream',
    };
  }
}