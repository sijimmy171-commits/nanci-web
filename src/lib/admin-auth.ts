import 'server-only';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

type AdminSessionUser = {
  email?: string | null;
  role?: string | null;
};

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as AdminSessionUser | undefined;

  if (!user?.email || user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return session;
}
