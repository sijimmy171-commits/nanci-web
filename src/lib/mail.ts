import nodemailer from 'nodemailer';
import { resolveMailConfig, sanitizeMailHeader } from '@/lib/mail-config';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;
let cachedConfigKey: string | null = null;

function getTransporter() {
  const resolved = resolveMailConfig(process.env);
  if (!resolved.configured) {
    return resolved;
  }

  const { config } = resolved;
  const configKey = `${config.host}:${config.port}:${config.user}:${config.recipient}`;
  if (!cachedTransporter || cachedConfigKey !== configKey) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    cachedConfigKey = configKey;
  }

  return { configured: true as const, config, transporter: cachedTransporter };
}

export async function sendInquiryNotification(data: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  product: string;
  message: string;
}) {
  const mail = getTransporter();

  if (!mail.configured) {
    console.warn(mail.error);
    return { success: false as const, error: mail.error };
  }

  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone || '未填写');
  const safeCompany = escapeHtml(data.company || '未填写');
  const safeProduct = escapeHtml(data.product);
  const safeMessage = escapeHtml(data.message);

  const mailOptions = {
    from: `"SUCI Website" <${mail.config.user}>`,
    to: mail.config.recipient,
    replyTo: sanitizeMailHeader(data.email),
    subject: sanitizeMailHeader(`新询盘通知：来自 ${data.name} (${data.company || '未填写'})`),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #0066b1; border-bottom: 2px solid #0066b1; padding-bottom: 10px;">新询盘提醒 (New Inquiry)</h2>
        <p><strong>客户姓名:</strong> ${safeName}</p>
        <p><strong>联系邮箱:</strong> ${safeEmail}</p>
        <p><strong>联系电话:</strong> ${safePhone}</p>
        <p><strong>公司名称:</strong> ${safeCompany}</p>
        <p><strong>意向产品:</strong> ${safeProduct}</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin-top: 20px;">
          <p><strong>详细留言:</strong></p>
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          此消息由 SUCI 官网询盘系统自动发送，请及时登录后台处理。
        </p>
      </div>
    `,
  };

  try {
    await mail.transporter.sendMail(mailOptions);
    return { success: true as const };
  } catch (error) {
    console.error('Mail Send Error:', error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Unknown SMTP delivery error',
    };
  }
}
