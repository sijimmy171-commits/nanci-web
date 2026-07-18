export type OwnedUpload =
  | { kind: 'local'; relativePath: string }
  | { kind: 'supabase'; objectPath: string };

function decodeObjectPath(value: string) {
  try {
    const segments = value.split('/').map(decodeURIComponent);
    if (segments.length < 2 || segments.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment) || segment === '.' || segment === '..')) {
      return null;
    }
    return segments.join('/');
  } catch {
    return null;
  }
}

export function resolveOwnedUpload(
  fileUrl: string,
  storage?: { supabaseUrl: string; bucket: string; publicUrl?: string | null } | null
): OwnedUpload | null {
  if (fileUrl.startsWith('/uploads/')) {
    const relativePath = decodeObjectPath(fileUrl.slice('/uploads/'.length));
    return relativePath ? { kind: 'local', relativePath } : null;
  }

  if (!storage) return null;

  const prefixes = [
    storage.publicUrl ? `${storage.publicUrl.replace(/\/+$/, '')}/` : null,
    `${storage.supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${encodeURIComponent(storage.bucket)}/`,
  ].filter((value): value is string => Boolean(value));

  for (const prefix of prefixes) {
    if (!fileUrl.startsWith(prefix)) continue;
    const objectPath = decodeObjectPath(fileUrl.slice(prefix.length));
    return objectPath ? { kind: 'supabase', objectPath } : null;
  }

  return null;
}
