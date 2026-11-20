import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Identifies an image from its first bytes. The client-supplied Content-Type is never
 * trusted: an attacker could label an HTML or script file as image/jpeg.
 */
export function detectImageExt(buf: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

export function createImageStore(dir: string) {
  mkdirSync(dir, { recursive: true });
  return {
    dir,
    /** Saves the image under a random name (no user input in the path) and returns the filename. */
    async save(buf: Buffer): Promise<string | null> {
      const ext = detectImageExt(buf);
      if (!ext) return null;
      const filename = `${randomBytes(12).toString('hex')}.${ext}`;
      await writeFile(join(dir, filename), buf);
      return filename;
    },
    /** Best-effort delete; a missing file is not an error. */
    async remove(filename: string): Promise<void> {
      // Filenames come from our own DB, but guard against path separators anyway.
      if (!/^[a-f0-9]+\.(jpg|png|webp)$/.test(filename)) return;
      await unlink(join(dir, filename)).catch(() => {});
    },
  };
}

export type ImageStore = ReturnType<typeof createImageStore>;
