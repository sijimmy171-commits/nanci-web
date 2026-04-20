import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInquiryNotification(data: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  product: string;
  message: string;
}) {
  const mailOptions = {
    from: `"SUCI Website" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_RECEIVE_EMAIL,
    subject: `新询盘通知：来自 ${data.name} (${data.company || '个人客户'})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #0066b1; border-bottom: 2px solid #0066b1; padding-bottom: 10px;">新询盘提醒 (New Inquiry)</h2>
        <p><strong>客户姓名:</strong> ${data.name}</p>
        <p><strong>联系邮箱:</strong> ${data.email}</p>
        <p><strong>联系电话:</strong> ${data.phone || '未填写'}</p>
        <p><strong>公司名称:</strong> ${data.company || '未填写'}</p>
        <p><strong>意向产品:</strong> ${data.product}</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin-top: 20px;">
          <p><strong>详细留言:</strong></p>
          <p style="white-space: pre-wrap;">${data.message}</p>
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
