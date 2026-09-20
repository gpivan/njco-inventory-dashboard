/* ============ NJ&CO — product image helpers ============ */

const DRIVE_ID_PATTERNS = [/drive\.google\.com\/file\/d\/([\w-]+)/, /drive\.google\.com\/(?:open|uc|thumbnail)\?(?:[^#]*&)?id=([\w-]+)/, /docs\.google\.com\/uc\?(?:[^#]*&)?id=([\w-]+)/];

export function driveFileId(url: string): string | null {
  for (const re of DRIVE_ID_PATTERNS) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export const isDriveFolderLink = (url: string) => /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\//.test(url);

// Drive share links return an HTML viewer page, not image bytes, so they can't be used
// in <img>. The /thumbnail endpoint serves the image itself (file must be shared as
// "Anyone with the link"). Any other URL is passed through untouched.
export function imageSrc(url: string | undefined): string {
  const u = (url || '').trim();
  if (!u || isDriveFolderLink(u)) return '';
  const id = driveFileId(u);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w600` : u;
}

// Downscale to a JPEG data URL so uploads stay small (the serverless body limit is ~4.5MB
// and phone photos are often 5–10MB).
export function resizeToJpeg(file: File, maxSide = 900, quality = 0.85): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable'));
      ctx.fillStyle = '#fff'; // flatten PNG transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve({ base64: dataUrl.split(',')[1], dataUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Could not read that image'));
    };
    img.src = objUrl;
  });
}
