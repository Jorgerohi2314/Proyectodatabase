/**
 * Validación estricta de documentos Word (.doc, .docx)
 * Verifica: extensión, MIME type real (magic bytes), tamaño
 */

const ALLOWED_MIME_TYPES = [
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
  'text/plain', // .txt
  'application/vnd.oasis.opendocument.text', // .odt
] as const;

const ALLOWED_EXTENSIONS = ['.doc', '.docx', '.pdf', '.txt', '.odt'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic bytes para detección real de tipo de archivo
const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  'application/msword': [
    new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]), // OLE2 Compound Document (.doc)
  ],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // ZIP-based (.docx)
  ],
  'application/pdf': [
    new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]), // %PDF-
  ],
  'application/vnd.oasis.opendocument.text': [
    new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // ZIP-based (.odt)
  ],
  // .txt files do not have a reliable magic byte signature
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  extension?: string;
}

/**
 * Obtiene la extensión del archivo (incluyendo el punto)
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Detecta el MIME type real leyendo los magic bytes del archivo
 * Previene spoofing de extensión
 */
async function detectMimeType(file: File): Promise<string | null> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  for (const [mimeType, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const signature of signatures) {
      // Ensure we don't read past the end of the buffer
      if (bytes.length < signature.length) continue;

      let matches = true;
      for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        // Special case for ZIP files (docx, odt)
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/vnd.oasis.opendocument.text') {
             try {
                const fullBuffer = await file.arrayBuffer();
                const decoder = new TextDecoder('utf-8');
                const content = decoder.decode(new Uint8Array(fullBuffer.slice(0, Math.min(2048, fullBuffer.byteLength))));
                
                if (mimeType === 'application/vnd.oasis.opendocument.text' && content.includes('mimetypeapplication/vnd.oasis.opendocument.text')) {
                    return 'application/vnd.oasis.opendocument.text';
                }
                if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (content.includes('word/') || content.includes('[Content_Types].xml'))) {
                    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                }
            } catch { /* ignore */ }
            // If we can't definitively determine the subtype, we'll fall through
        } else {
            return mimeType;
        }
      }
    }
  }

  // Fallback for TXT files
  if (file.type === 'text/plain') {
    return 'text/plain';
  }
  
  // Try to determine ODT/DOCX if magic bytes were ambiguous
  if (bytes[0] === 0x50 && bytes[1] === 0x4B) { // ZIP file
     try {
        const fullBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        const content = decoder.decode(new Uint8Array(fullBuffer.slice(0, Math.min(2048, fullBuffer.byteLength))));
        if (content.includes('mimetypeapplication/vnd.oasis.opendocument.text')) {
            return 'application/vnd.oasis.opendocument.text';
        }
        if (content.includes('word/') || content.includes('[Content_Types].xml')) {
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
    } catch { /* ignore */ }
  }


  return null;
}

/**
 * Valida que el archivo sea un documento Word válido
 * Verifica: tamaño, extensión, MIME type real (magic bytes)
 */
export async function validateDocument(file: File): Promise<FileValidationResult> {
  // 1. Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'El archivo está vacío',
    };
  }

  // 2. Validar extensión
  const extension = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `Extensión no permitida: "${extension}". Solo se aceptan: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // 3. Validar MIME type real (magic bytes) - previene spoofing
  const detectedMimeType = await detectMimeType(file);
  if (!detectedMimeType || !ALLOWED_MIME_TYPES.includes(detectedMimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `Tipo de archivo no válido. Detectado: ${detectedMimeType || 'desconocido'}. Solo se aceptan documentos (doc, pdf, etc).`,
    };
  }

  // 4. Verificar coherencia extensión-MIME
  const expectedMimeForExtension: Record<string, string | string[]> = {
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.odt': 'application/vnd.oasis.opendocument.text',
  };

  const expectedMime = expectedMimeForExtension[extension];
  if (expectedMime && (Array.isArray(expectedMime) ? !expectedMime.includes(detectedMimeType) : detectedMimeType !== expectedMime)) {
    // Advertencia pero no bloqueo
    console.warn(`Extension-MIME mismatch: ${extension} -> ${detectedMimeType} (expected ${expectedMime})`);
  }

  return {
    valid: true,
    mimeType: detectedMimeType,
    extension,
  };
}

/**
 * Genera un nombre de archivo seguro y único
 */
export function generateSafeFilename(originalName: string, userId: string): string {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = originalName
    .replace(extension, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100);
  return `${userId}_${timestamp}_${random}_${safeName}${extension}`;
}

export { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE };