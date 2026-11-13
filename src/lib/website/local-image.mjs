import { MAX_LOCAL_IMAGE_BYTES } from './content.mjs';

// Browser-only demo media preparation. Django will own media uploads in production.
export async function prepareAnnouncementImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Selecciona una imagen PNG, JPG o WebP.');
  if (file.size > 8 * 1024 * 1024) throw new Error('La imagen original debe pesar como máximo 8 MB.');
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    let scale = Math.min(1, 900 / bitmap.width, 900 / bitmap.height);
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('El navegador no permite preparar esta imagen. Usa una URL de imagen.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/webp', .82 - attempt * .06);
      if ((data.split(',')[1]?.length ?? Infinity) / 4 * 3 <= MAX_LOCAL_IMAGE_BYTES) return data;
      scale *= .8;
    }
    throw new Error('No se pudo ajustar la imagen. Prueba con una versión más pequeña o una URL.');
  } finally { bitmap?.close(); }
}
