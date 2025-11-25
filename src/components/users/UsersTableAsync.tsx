import { db } from '@/lib/db';
import UsersTable from '@/components/users/UsersTable';

interface UsersTableAsyncProps {
  currentUserId: string;
}

export default async function UsersTableAsync({ currentUserId }: UsersTableAsyncProps) {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userName: true,
      userEmail: true,
      userRole: true,
      isActive: true,
      createdAt: true
    }
  });

  const usersData = users.map(user => ({
    id: user.id,
    userName: user.userName,
    userEmail: user.userEmail,
    userRole: user.userRole as string,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString()
  }));

  return <UsersTable users={usersData} currentUserId={currentUserId} />;
}
