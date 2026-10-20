/**
 * Servicio de orquestación para subida de foto de perfil.
 * La imagen se almacena directamente en la BD (columna BLOB) para simplificar
 * el despliegue en producción: un único archivo (production.db) contiene datos y ficheros,
 * sin depender de rutas de filesystem, URLs base ni almacenamiento externo.
 */

import { db } from '@/lib/db';
import { validateImage } from './validation';

export interface ProfilePictureUploadResult {
  success: boolean;
  data?: {
    url: string;
    fileName: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}

export interface ProfilePictureInfo {
  url: string;
  fileName: string;
  size: number | null;
  mimeType: string | null;
  uploadedAt: Date | null;
}

export interface ProfilePictureFileData {
  buffer: Uint8Array;
  fileName: string;
  mimeType: string;
}

/**
 * Servicio para gestión completa de foto de perfil
 */
export class ProfilePictureUploadService {
  /**
   * Sube una foto de perfil, valida, almacena en BD y actualiza el perfil
   */
  async uploadProfilePicture(
    userId: string,
    file: File
  ): Promise<ProfilePictureUploadResult> {
    // 1. Validar archivo
    const validation = await validateImage(file);
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

    // 4. Guardar en BD (sobrescribe la foto anterior si existía)
    await db.userProfile.update({
      where: { id: userId },
      data: {
        profilePictureFile: buffer,
        profilePictureFileName: file.name,
        profilePictureMimeType: validation.mimeType ?? 'image/jpeg',
        profilePictureSize: buffer.length,
      },
    });

    return {
      success: true,
      data: {
        url: `/api/users/${userId}/profile-picture/file`,
        fileName: file.name,
        size: buffer.length,
        mimeType: validation.mimeType ?? 'image/jpeg',
      },
    };
  }

  /**
   * Elimina la foto de perfil de un usuario (solo BD)
   */
  async deleteProfilePicture(userId: string): Promise<ProfilePictureUploadResult> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: { profilePictureFileName: true },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (!user.profilePictureFileName) {
      return { success: false, error: 'El usuario no tiene foto de perfil subida' };
    }

    await db.userProfile.update({
      where: { id: userId },
      data: {
        profilePictureFile: null,
        profilePictureFileName: null,
        profilePictureMimeType: null,
        profilePictureSize: null,
      },
    });

    return { success: true };
  }

  /**
   * Obtiene información de la foto de perfil almacenada
   */
  async getProfilePictureInfo(userId: string): Promise<ProfilePictureInfo | null> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: {
        profilePictureFileName: true,
        profilePictureSize: true,
        profilePictureMimeType: true,
        updatedAt: true,
      },
    });

    if (!user?.profilePictureFileName) return null;

    return {
      url: `/api/users/${userId}/profile-picture/file`,
      fileName: user.profilePictureFileName,
      size: user.profilePictureSize,
      mimeType: user.profilePictureMimeType,
      uploadedAt: user.updatedAt,
    };
  }

  /**
   * Obtiene los bytes de la foto de perfil para servirla por HTTP
   */
  async getProfilePictureFile(userId: string): Promise<ProfilePictureFileData | null> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: {
        profilePictureFile: true,
        profilePictureFileName: true,
        profilePictureMimeType: true,
      },
    });

    if (!user?.profilePictureFile) return null;

    return {
      buffer: user.profilePictureFile,
      fileName: user.profilePictureFileName ?? 'profile-picture',
      mimeType: user.profilePictureMimeType ?? 'image/jpeg',
    };
  }
}