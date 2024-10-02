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
        try {
          const user = await fetchUser(token);
          
          setAuthData(user);
  
          router.replace('/pulls');
        } catch (error) {
          router.replace('/auth');
        }
      });
  }, [router, setAuthData]);

  return null;
}
