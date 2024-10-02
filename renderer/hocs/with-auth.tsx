import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth';
import { GithubUser } from '../types/github';
import { fetchUser } from '../apis/github';

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
      window.ipc.invoke('storage:get', 'auth.token')
        .then(async (token?: string) => {
          if (!token) {
            router.replace('/auth');
            return;
          }
          try {
            const user = await fetchUser(token);
            
            setAuthData(user);
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
