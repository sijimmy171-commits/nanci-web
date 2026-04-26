import nodemailer from 'nodemailer';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendInquiryNotification(data: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  product: string;
  message: string;
}) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('SMTP is not configured. Skipping inquiry email notification.');
    return { success: false, error: 'SMTP not configured' };
  }

  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone || '未填写');
  const safeCompany = escapeHtml(data.company || '未填写');
  const safeProduct = escapeHtml(data.product);
  const safeMessage = escapeHtml(data.message);

  const mailOptions = {
    from: `"SUCI Website" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_RECEIVE_EMAIL,
    subject: `新询盘通知：来自 ${safeName} (${safeCompany})`,
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
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Mail Send Error:', error);
    return { success: false, error };
  }
}
