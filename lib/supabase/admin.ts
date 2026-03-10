import { createClient } from './client';

/**
 * Upload an image to Supabase Storage with UUID-based path to prevent collisions.
 * Falls back to signed URL upload if direct upload fails (auth/RLS).
 */
export async function uploadImage(
  file: File,
  bucket: string,
  folder: string
): Promise<string> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-z0-9.-]/gi, '_');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;

  // Try direct upload first
  const { error: directError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (directError) {
    // Fall back to signed URL upload (bypasses some RLS restrictions)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (signedError || !signedData) {
      throw new Error(
        `Upload failed: ${signedError?.message || 'Could not create signed URL'}`
      );
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(path, signedData.token, file);

    if (uploadError) {
      throw new Error(`Signed upload failed: ${uploadError.message}`);
    }
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its full public URL.
 */
export async function deleteStorageFile(
  bucket: string,
  fullUrl: string
): Promise<void> {
  const supabase = createClient();
  // Extract the storage path from the full URL
  // URL format: .../storage/v1/object/public/{bucket}/{path}
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = fullUrl.indexOf(marker);
  if (idx === -1) {
    throw new Error(`Could not extract path from URL for bucket "${bucket}"`);
  }
  const path = fullUrl.slice(idx + marker.length);

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Trigger ISR revalidation for given paths. Fire-and-forget.
 */
export async function triggerRevalidation(paths: string[]): Promise<void> {
  try {
    fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // Fire-and-forget — don't block on revalidation errors
  }
}

/**
 * Generate a URL-safe slug from a name string.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
