import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthNetworkError } from '../components/auth-network-error';
import { useAuthStore } from '../stores/auth';
import { clearAuthSession, type AuthViewState, recoverStoredAuthSession } from '../utils/auth';

export default function HomePage() {
  const router = useRouter();
  const { setData: setAuthData } = useAuthStore();
  const [viewState, setViewState] = useState<AuthViewState>('loading');

  const restoreAuthSession = useCallback(async () => {
    setViewState('loading');

    const result = await recoverStoredAuthSession();

    switch (result.status) {
      case 'authorized':
        setAuthData({ user: result.user, token: result.token });
        router.replace('/pulls');
        return;
      case 'missing_token':
        setAuthData(null);
        router.replace('/auth');
        return;
      case 'unauthorized':
        await clearAuthSession(setAuthData);
        router.replace('/auth');
        return;
      case 'network_error':
        setViewState('network_error');
        return;
      case 'error':
        setAuthData(null);
        router.replace('/auth');
        return;
    }
  }, [router, setAuthData]);

  useEffect(() => {
    restoreAuthSession();
  }, [restoreAuthSession]);

  if (viewState === 'network_error') {
    return <AuthNetworkError onRetry={restoreAuthSession} />;
  }

  return null;
}
