import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { fetchUser } from '../apis/github';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    window.ipc.invoke('storage:get', 'auth.token')
      .then(async (token) => {
        try {
          const user = await fetchUser(token);
          
          console.log(user);
  
          router.replace('/pulls');
        } catch (error) {
          router.replace('/auth');
        }
      });
  }, []);

  return null;
}
