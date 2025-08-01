import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth';
import type { GithubUser } from '../types/github';
import { fetchUser } from '../apis/github';
import { ipcHandler } from '../utils/ipc';

export interface AuthProps {
  auth: GithubUser;
}

export const withAuth = <P extends AuthProps>(WrappedComponent: React.ComponentType<P>) => {
  const Component = (props: Omit<P, keyof AuthProps>) => {
    const router = useRouter();
    const { data: authData, setData: setAuthData } = useAuthStore();

    useEffect(() => {
      if (authData) {
        return;
      }
      ipcHandler.getStorage('auth.token')
        .then(async (token?: string) => {
          if (!token) {
            router.replace('/auth');
            return;
          }
          try {
            const user = await fetchUser(token);
            
            setAuthData({ user, token });
          } catch (error) {
            router.replace('/auth');
          }
        });
    }, [router, authData, setAuthData]);

    if (!authData) {
      return null;
    }
    return <WrappedComponent {...(props as P)} auth={authData} />;
  };
  return Component;
};
