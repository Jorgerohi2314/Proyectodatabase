/**
 * Servicio de orquestación para subida de curriculum
 * Coordina validación, almacenamiento y actualización en BD
 */

import { db } from '@/lib/db';
import { validateDocument, FileValidationResult, generateSafeFilename } from './validation';
import { createStorageAdapter, StorageAdapter, UploadResult, StorageConfig } from './storage';

export interface CurriculumUploadResult {
  success: boolean;
  data?: {
    url: string;
    path: string;
    fileName: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}

export interface CurriculumInfo {
  url: string;
  path: string;
  fileName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date | null;
}

/**
 * Servicio para gestión completa de curriculum
 */
export class CurriculumUploadService {
  private storage: StorageAdapter;

  constructor(storageConfig?: StorageConfig) {
    this.storage = createStorageAdapter(storageConfig || getStorageConfig());
  }

  /**
   * Sube un curriculum, valida, almacena y actualiza la BD
   * Transacción atómica: si falla BD, elimina archivo subido (rollback)
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

    // 2. Verificar que el usuario existe y obtener curriculum anterior
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: { id: true, curriculum: true },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // 3. Convertir File a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Generar nombre seguro
    const safeFilename = generateSafeFilename(file.name, userId);

    // 5. Subir a almacenamiento
    let uploadResult: UploadResult;
    try {
      uploadResult = await this.storage.upload(buffer, safeFilename, validation.mimeType!);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      return { success: false, error: 'Error al guardar el archivo' };
    }

    // 6. Si había curriculum anterior, eliminarlo del almacenamiento (best effort)
    if (user.curriculum) {
      try {
        await this.storage.delete(user.curriculum);
      } catch (e) {
        console.warn('No se pudo eliminar curriculum anterior:', e);
        // No fallar la operación por esto
      }
    }

    // 7. Actualizar BD con la nueva ruta
    try {
      await db.userProfile.update({
        where: { id: userId },
        data: { curriculum: uploadResult.url }, // Usar la URL absoluta
      });
    } catch (error) {
      // ROLLBACK: Eliminar archivo subido si falla la BD
      try {
        await this.storage.delete(uploadResult.path);
      } catch (rollbackError) {
        console.error('ROLLBACK FALLIDO - archivo huérfano:', uploadResult.path, rollbackError);
      }
      console.error('Error actualizando BD:', error);
      return { success: false, error: 'Error al actualizar el perfil del usuario' };
    }

    return {
      success: true,
      data: {
        url: uploadResult.url,
        path: uploadResult.path,
        fileName: uploadResult.originalName,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
      },
    };
  }

  /**
   * Elimina el curriculum de un usuario (archivo + BD)
   */
  async deleteCurriculum(userId: string): Promise<CurriculumUploadResult> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: { curriculum: true },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (!user.curriculum) {
      return { success: false, error: 'El usuario no tiene curriculum subido' };
    }

    // Eliminar del almacenamiento
    try {
      await this.storage.delete(user.curriculum);
    } catch (e) {
      console.warn('Error eliminando archivo:', e);
    }

    // Limpiar BD
    await db.userProfile.update({
      where: { id: userId },
      data: { curriculum: null },
    });

    return { success: true };
  }

  /**
   * Obtiene información del curriculum y URL de descarga firmada
   */
  async getCurriculumInfo(userId: string): Promise<CurriculumInfo | null> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: { curriculum: true, updatedAt: true },
    });

    if (!user?.curriculum) return null;

    let url: string;
    if (typeof this.storage.getSignedUrl === 'function') {
      url = await this.storage.getSignedUrl(user.curriculum, 3600);
    } else {
      // Local storage - URL ya es pública
      url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/uploads/${user.curriculum}`;
    }

    return {
      url,
      path: user.curriculum,
      fileName: user.curriculum.split('/').pop() || 'curriculum',
      size: 0, // No disponible sin stat del archivo
      mimeType: 'application/octet-stream',
      uploadedAt: user.updatedAt,
    };
  }

  /**
   * Obtiene URL de descarga directa (para botón descargar)
   */
  async getDownloadUrl(userId: string, expiresIn = 3600): Promise<string | null> {
    const user = await db.userProfile.findUnique({
      where: { id: userId },
      select: { curriculum: true },
    });

    if (!user?.curriculum) return null;

    if (typeof this.storage.getSignedUrl === 'function') {
      return this.storage.getSignedUrl(user.curriculum, expiresIn);
    }

    // Local storage
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/uploads/${user.curriculum}`;
  }
}

/**
 * Configuración por defecto según entorno
 */
function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER as StorageConfig['provider']) || 'local';

  switch (provider) {
    case 's3':
      return {
        provider: 's3',
        s3: {
          bucket: process.env.S3_BUCKET!,
          region: process.env.S3_REGION!,
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          publicBaseUrl: process.env.S3_PUBLIC_URL,
        },
      };
    case 'r2':
      return {
        provider: 'r2',
        r2: {
          bucket: process.env.R2_BUCKET!,
          accountId: process.env.R2_ACCOUNT_ID!,
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
          publicBaseUrl: process.env.R2_PUBLIC_URL,
        },
      };
    case 'local':
    default:
      return {
        provider: 'local',
        local: {
          uploadDir: process.env.UPLOAD_DIR || './public/uploads',
          publicBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
      };
  }
}