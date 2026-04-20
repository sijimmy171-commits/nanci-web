import type { NextConfig } from "next";

function getStorageImagePattern() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const publicUrl = process.env.SUPABASE_STORAGE_PUBLIC_URL;
  const sourceUrl = publicUrl || supabaseUrl;

  if (!sourceUrl) return null;

  try {
    const url = new URL(sourceUrl);
    const pathname = publicUrl
      ? `${url.pathname.replace(/\/$/, '')}/**`
      : `/storage/v1/object/public/${bucket || '**'}/**`;

    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname,
      search: '',
    };
  } catch {
    return null;
  }
}

const storageImagePattern = getStorageImagePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: storageImagePattern ? [storageImagePattern] : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
