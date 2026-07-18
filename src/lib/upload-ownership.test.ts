import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveOwnedUpload } from './upload-ownership.ts';

const storage = {
  supabaseUrl: 'https://project.supabase.co',
  bucket: 'nanci-uploads',
};

test('recognizes an object in the configured public Supabase bucket', () => {
  assert.deepEqual(
    resolveOwnedUpload('https://project.supabase.co/storage/v1/object/public/nanci-uploads/products/images/file.webp', storage),
    { kind: 'supabase', objectPath: 'products/images/file.webp' }
  );
});

test('rejects objects from other hosts or buckets', () => {
  assert.equal(resolveOwnedUpload('https://other.example.com/products/images/file.webp', storage), null);
  assert.equal(resolveOwnedUpload('https://project.supabase.co/storage/v1/object/public/other/file.webp', storage), null);
});

test('accepts safe local uploads and rejects traversal', () => {
  assert.deepEqual(resolveOwnedUpload('/uploads/products/file.webp'), {
    kind: 'local',
    relativePath: 'products/file.webp',
  });
  assert.equal(resolveOwnedUpload('/uploads/../secret.txt'), null);
  assert.equal(resolveOwnedUpload('/uploads/products/%2e%2e/secret.txt'), null);
});
