export type MailEnvironment = { [key: string]: string | undefined };

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  recipient: string;
};

export function resolveMailConfig(env: MailEnvironment):
  | { configured: true; config: MailConfig }
  | { configured: false; error: string } {
  const host = env.SMTP_HOST?.trim();
  const port = Number(env.SMTP_PORT);
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS;
  const recipient = env.ADMIN_RECEIVE_EMAIL?.trim();

  if (!host || !user || !pass || !recipient || !Number.isInteger(port) || port < 1 || port > 65535) {
    return {
      configured: false,
      error: 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and ADMIN_RECEIVE_EMAIL must all be configured.',
    };
  }

  return {
    configured: true,
    config: {
      host,
      port,
      secure: port === 465,
      user,
      pass,
      recipient,
    },
  };
}

export function sanitizeMailHeader(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}
