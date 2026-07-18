import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMailConfig, sanitizeMailHeader } from './mail-config.ts';

test('requires every SMTP setting including the recipient', () => {
  const result = resolveMailConfig({
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '587',
    SMTP_USER: 'sender@example.com',
    SMTP_PASS: 'secret',
  });

  assert.equal(result.configured, false);
});

test('uses implicit TLS only for port 465', () => {
  const base = {
    SMTP_HOST: 'smtp.example.com',
    SMTP_USER: 'sender@example.com',
    SMTP_PASS: 'secret',
    ADMIN_RECEIVE_EMAIL: 'sales@example.com',
  };

  const startTls = resolveMailConfig({ ...base, SMTP_PORT: '587' });
  const implicitTls = resolveMailConfig({ ...base, SMTP_PORT: '465' });

  assert.equal(startTls.configured && startTls.config.secure, false);
  assert.equal(implicitTls.configured && implicitTls.config.secure, true);
});

test('removes line breaks from mail headers', () => {
  assert.equal(sanitizeMailHeader('Customer\r\nBcc: other@example.com'), 'Customer Bcc: other@example.com');
});
