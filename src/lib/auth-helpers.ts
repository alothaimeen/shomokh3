import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) redirect('/dashboard');
  return session;
}

export async function requireTeacher() {
  return await requireRole(['TEACHER', 'ADMIN']);
}

export async function requireStudent() {
  return await requireRole(['STUDENT']);
}

export async function requireAdmin() {
  return await requireRole(['ADMIN']);
}
