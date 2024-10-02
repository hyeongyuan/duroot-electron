import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { fetchUser } from '../apis/github';
import { useAuthStore } from '../stores/auth';

export default function HomePage() {
  const router = useRouter();
  const { setData: setAuthData } = useAuthStore();

  useEffect(() => {
    window.ipc.invoke('storage:get', 'auth.token')
      .then(async (token) => {
        if (!token) {
          router.replace('/auth');
          return;
        }
        try {
          const user = await fetchUser(token);
          
          setAuthData({ user, token });
  
          router.replace('/pulls');
        } catch (error) {
          await window.ipc.invoke('storage:delete', 'auth.token');

          router.replace('/auth');
        }
      });
  }, [router, setAuthData]);

  return null;
}
