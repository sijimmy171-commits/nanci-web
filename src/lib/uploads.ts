import 'server-only';

import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { resolveOwnedUpload } from '@/lib/upload-ownership';

type SaveUploadedFileOptions = {
  file: File | null;
  folder: string;
  allowedExtensions: string[];
  fallbackUrl?: string | null;
};

type CreateSignedUploadTargetOptions = {
  filename: string;
  contentType: string;
  size: number;
  folder: string;
  allowedExtensions: string[];
};

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function getExtension(filename: string) {
  const ext = path.extname(filename || '').toLowerCase();
  return ext;
}

function getStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const publicUrl = process.env.SUPABASE_STORAGE_PUBLIC_URL?.replace(/\/+$/, '');

  if (!supabaseUrl || !serviceRoleKey || !bucket) {
    return null;
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    bucket,
    publicUrl,
  };
}

function getContentType(ext: string, fallbackType: string) {
  if (fallbackType && fallbackType !== 'application/octet-stream') {
    return fallbackType;
  }

  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };

  return contentTypes[ext] || 'application/octet-stream';
}

function encodeObjectPath(objectPath: string) {
  return objectPath.split('/').map(encodeURIComponent).join('/');
}

async function saveToLocalUploads(file: File, safeFolder: string, filename: string) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
  await mkdir(uploadDir, { recursive: true });

  const absolutePath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, bytes);

  return `/uploads/${safeFolder}/${filename}`;
}

async function saveToSupabaseStorage(file: File, safeFolder: string, filename: string, ext: string) {
  const storage = getStorageConfig();
  if (!storage) return null;

  const objectPath = `${safeFolder}/${filename}`;
  const encodedPath = encodeObjectPath(objectPath);
  const uploadUrl = `${storage.supabaseUrl}/storage/v1/object/${encodeURIComponent(storage.bucket)}/${encodedPath}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      apikey: storage.serviceRoleKey,
      Authorization: `Bearer ${storage.serviceRoleKey}`,
      'Content-Type': getContentType(ext, file.type),
      'Cache-Control': '31536000',
      'x-upsert': 'false',
    },
    body: bytes,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Supabase Storage upload failed (${response.status}): ${details || response.statusText}`);
  }

  if (storage.publicUrl) {
    return `${storage.publicUrl}/${encodedPath}`;
  }

  return `${storage.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(storage.bucket)}/${encodedPath}`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateUploadFile(filename: string, size: number, allowedExtensions: string[]) {
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File size (${(size / 1024 / 1024).toFixed(1)} MB) exceeds the 10 MB limit.`);
  }

  const ext = getExtension(filename);
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Unsupported file type: ${ext || 'unknown'}`);
  }

  return ext;
}

function buildStoragePublicUrl(storage: NonNullable<ReturnType<typeof getStorageConfig>>, encodedPath: string) {
  if (storage.publicUrl) {
    return `${storage.publicUrl}/${encodedPath}`;
  }

  return `${storage.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(storage.bucket)}/${encodedPath}`;
}

export async function createSignedUploadTarget({
  filename: originalFilename,
  contentType,
  size,
  folder,
  allowedExtensions,
}: CreateSignedUploadTargetOptions) {
  const storage = getStorageConfig();
  if (!storage) {
    throw new Error('Upload storage is not configured. Please configure Supabase Storage environment variables before uploading files in production.');
  }

  const ext = validateUploadFile(originalFilename, size, allowedExtensions);
  const safeFolder = sanitizeSegment(folder) || 'misc';
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const objectPath = `${safeFolder}/${filename}`;
  const encodedPath = encodeObjectPath(objectPath);
  const uploadUrl = `${storage.supabaseUrl}/storage/v1/object/upload/sign/${encodeURIComponent(storage.bucket)}/${encodedPath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: storage.serviceRoleKey,
      Authorization: `Bearer ${storage.serviceRoleKey}`,
      'Content-Type': 'application/json',
      'x-upsert': 'false',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Supabase signed upload URL failed (${response.status}): ${details || response.statusText}`);
  }

  const data = (await response.json()) as { url?: string; signedUrl?: string; signedURL?: string };
  const signedPath = data.signedUrl || data.signedURL || data.url;
  if (!signedPath) {
    throw new Error('Supabase did not return a signed upload URL.');
  }

  const signedUrl = signedPath.startsWith('http') ? signedPath : `${storage.supabaseUrl}/storage/v1${signedPath}`;

  return {
    signedUrl,
    fileUrl: buildStoragePublicUrl(storage, encodedPath),
    contentType: getContentType(ext, contentType),
  };
}

export async function saveUploadedFile({
  file,
  folder,
  allowedExtensions,
  fallbackUrl = null,
}: SaveUploadedFileOptions) {
  if (!file || file.size === 0) {
    return fallbackUrl;
  }

  const ext = validateUploadFile(file.name, file.size, allowedExtensions);

  const safeFolder = sanitizeSegment(folder) || 'misc';
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const storageUrl = await saveToSupabaseStorage(file, safeFolder, filename, ext);
  if (storageUrl) return storageUrl;

  if (process.env.VERCEL) {
    throw new Error('Upload storage is not configured. Please configure Supabase Storage environment variables before uploading files in production.');
  }

  return saveToLocalUploads(file, safeFolder, filename);
}

export async function deleteUploadedFile(fileUrl: string | null | undefined) {
  if (!fileUrl) return false;

  const storage = getStorageConfig();
  const owned = resolveOwnedUpload(fileUrl, storage);
  if (!owned) return false;

  if (owned.kind === 'local') {
    const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
    const absolutePath = path.resolve(uploadsRoot, ...owned.relativePath.split('/'));
    if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) return false;

    try {
      await unlink(absolutePath);
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
        throw error;
      }
    }
    return true;
  }

  if (!storage) return false;
  const encodedPath = encodeObjectPath(owned.objectPath);
  const deleteUrl = `${storage.supabaseUrl}/storage/v1/object/${encodeURIComponent(storage.bucket)}/${encodedPath}`;
  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      apikey: storage.serviceRoleKey,
      Authorization: `Bearer ${storage.serviceRoleKey}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const details = await response.text().catch(() => '');
    throw new Error(`Supabase Storage deletion failed (${response.status}): ${details || response.statusText}`);
  }

  return true;
}
