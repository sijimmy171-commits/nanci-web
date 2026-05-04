import 'server-only';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

type SaveUploadedFileOptions = {
  file: File | null;
  folder: string;
  allowedExtensions: string[];
  fallbackUrl?: string | null;
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

export async function saveUploadedFile({
  file,
  folder,
  allowedExtensions,
  fallbackUrl = null,
}: SaveUploadedFileOptions) {
  if (!file || file.size === 0) {
    return fallbackUrl;
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 10 MB limit.`);
  }

  const ext = getExtension(file.name);
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Unsupported file type: ${ext || 'unknown'}`);
  }

  const safeFolder = sanitizeSegment(folder) || 'misc';
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const storageUrl = await saveToSupabaseStorage(file, safeFolder, filename, ext);
  if (storageUrl) return storageUrl;

  if (process.env.VERCEL) {
    throw new Error('Upload storage is not configured. Please configure Supabase Storage environment variables before uploading files in production.');
  }

  return saveToLocalUploads(file, safeFolder, filename);
}
