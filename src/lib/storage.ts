/**
 * File storage — Supabase Storage (private bucket).
 *
 * Legacy documents (pre-migration) have fileUrl starting with "data:" (base64).
 * New uploads store a storage path in both fileKey and fileUrl.
 *
 * To swap storage providers in the future, replace uploadFile / deleteFile /
 * getSignedUrl only — the rest of the app stays the same.
 */
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "documents";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface UploadResult {
  key: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export function validateFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed: PDF, JPEG, PNG, WebP, Word, Excel.`,
    };
  }
  return { valid: true };
}

/**
 * Upload a file to Supabase Storage.
 * @param clientId  Used to organise files into per-client folders.
 */
export async function uploadFile(
  file: File,
  clientId: string
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `${clientId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const supabase = createAdminClient();
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, bytes, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return {
    key,
    url: key, // We store the path; call getSignedUrl() to get a usable URL
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

/**
 * Delete a file from Supabase Storage.
 * Silently skips legacy base64 entries that have no actual storage object.
 */
export async function deleteFile(key: string): Promise<void> {
  if (!key || key.startsWith("data:")) return;
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKET).remove([key]);
}

/**
 * Generate a time-limited signed URL for a stored file.
 * For legacy base64 entries the raw data URL is returned unchanged.
 */
export async function getSignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  if (key.startsWith("data:")) return key; // Legacy base64 — use as-is
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn);
  if (error) throw new Error(`Could not generate URL: ${error.message}`);
  return data.signedUrl;
}

export const DOCUMENT_TYPES = [
  "National ID",
  "Passport",
  "Driver's License",
  "Company Registration",
  "Tax Certificate",
  "Contract",
  "Agreement",
  "Invoice",
  "Insurance Certificate",
  "Business License",
  "Financial Statement",
  "Bank Statement",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
