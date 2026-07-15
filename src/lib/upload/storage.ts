/**
 * Abstracción de almacenamiento para curriculum
 * Soporta: Local filesystem, AWS S3, Cloudflare R2 (S3-compatible), Vercel Blob
 */

export type StorageProvider = 'local' | 's3' | 'r2' | 'vercel-blob';

export interface StorageConfig {
  provider: StorageProvider;
  local?: {
    uploadDir: string;
    publicBaseUrl: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicBaseUrl?: string; // CloudFront URL si usa CDN
  };
  r2?: {
    bucket: string;
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicBaseUrl?: string;
  };
  vercelBlob?: {
    token: string;
  };
}

export interface UploadResult {
  url: string;        // URL pública o firmada para acceso
  path: string;       // Ruta/clave interna del archivo
  size: number;
  mimeType: string;
  originalName: string;
}

export interface StorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
  delete(path: string): Promise<void>;
  getSignedUrl?(path: string, expiresIn?: number): Promise<string>;
}

/**
 * Adaptador para almacenamiento local (desarrollo / self-hosted)
 * Guarda en filesystem y sirve via /uploads/...
 */
export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;
  private publicBaseUrl: string;

  constructor(config: { uploadDir: string; publicBaseUrl: string }) {
    this.uploadDir = config.uploadDir;
    this.publicBaseUrl = config.publicBaseUrl.replace(/\/$/, '');
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists() {
    const fs = await import('fs');
    const path = await import('path');
    const curriculumDir = path.join(this.uploadDir, 'curriculum');
    if (!fs.existsSync(curriculumDir)) {
      fs.mkdirSync(curriculumDir, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const crypto = await import('crypto');

    const ext = path.extname(filename);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const relativePath = path.join('curriculum', uniqueName);
    const filePath = path.join(this.uploadDir, relativePath);

    await fs.writeFile(filePath, file);

    return {
      url: `${this.publicBaseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
      path: relativePath.replace(/\\/g, '/'),
      size: file.length,
      mimeType,
      originalName: filename,
    };
  }

  async delete(relativePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(this.uploadDir, relativePath);
    try {
      await fs.unlink(filePath);
    } catch (e) {
      // Ignorar si no existe
      const err = e as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') throw e;
    }
  }
}

/**
 * Adaptador para AWS S3 (producción recomendada)
 * Usa URLs firmadas para acceso privado seguro
 */
export class S3StorageAdapter implements StorageAdapter {
  private s3Client: any;
  private bucket: string;
  private publicBaseUrl?: string;
  private PutObjectCommand: any;
  private DeleteObjectCommand: any;
  private GetObjectCommand: any;
  private getSignedUrlFn: any;

  constructor(private config: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicBaseUrl?: string;
  }) {
    this.bucket = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl;
  }

  private async init() {
    if (this.s3Client) return;
    const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
    this.PutObjectCommand = PutObjectCommand;
    this.DeleteObjectCommand = DeleteObjectCommand;
    this.GetObjectCommand = GetObjectCommand;
    this.getSignedUrlFn = getSignedUrl;
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    await this.init();
    const crypto = await import('crypto');
    const path = await import('path');
    const ext = path.extname(filename);
    const key = `curriculum/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

    await this.s3Client.send(
      new this.PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      })
    );

    const url = this.publicBaseUrl
      ? `${this.publicBaseUrl}/${key}`
      : await this.getSignedUrl(key);

    return {
      url,
      path: key,
      size: file.length,
      mimeType,
      originalName: filename,
    };
  }

  async delete(path: string): Promise<void> {
    await this.init();
    await this.s3Client.send(new this.DeleteObjectCommand({ Bucket: this.bucket, Key: path }));
  }

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    await this.init();
    const command = new this.GetObjectCommand({ Bucket: this.bucket, Key: path });
    return this.getSignedUrlFn(this.s3Client, command, { expiresIn });
  }
}

/**
 * Factory para crear el adaptador según configuración
 */
export function createStorageAdapter(config: StorageConfig): StorageAdapter {
  switch (config.provider) {
    case 'local': {
      if (!config.local) throw new Error('Configuración local requerida');
      return new LocalStorageAdapter(config.local);
    }
    case 's3': {
      if (!config.s3) throw new Error('Configuración S3 requerida');
      return new S3StorageAdapter(config.s3);
    }
    case 'r2': {
      if (!config.r2) throw new Error('Configuración R2 requerida');
      return new S3StorageAdapter({
        bucket: config.r2.bucket,
        region: 'auto',
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
        publicBaseUrl: config.r2.publicBaseUrl,
      });
    }
    case 'vercel-blob':
      throw new Error('Vercel Blob adapter no implementado. Usa local/S3/R2.');
    default:
      throw new Error(`Proveedor de almacenamiento no soportado: ${config.provider}`);
  }
}

/**
 * Configuración por defecto según variables de entorno
 */
export function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER as StorageProvider) || 'local';

  switch (provider) {
    case 's3':
      if (!process.env.S3_BUCKET || !process.env.S3_REGION || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
        throw new Error('Variables de entorno S3 incompletas');
      }
      return {
        provider: 's3',
        s3: {
          bucket: process.env.S3_BUCKET,
          region: process.env.S3_REGION,
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          publicBaseUrl: process.env.S3_PUBLIC_URL,
        },
      };
    case 'r2':
       if (!process.env.R2_BUCKET || !process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
        throw new Error('Variables de entorno R2 incompletas');
      }
      return {
        provider: 'r2',
        r2: {
          bucket: process.env.R2_BUCKET,
          accountId: process.env.R2_ACCOUNT_ID,
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
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
