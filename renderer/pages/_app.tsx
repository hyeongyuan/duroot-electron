import type { AppProps } from 'next/app';
import { useEffect } from 'react';

import { QueryProvider } from '../providers/query-provider';

import { usePullsHideLabelsStore } from '../stores/pulls';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const { init } = usePullsHideLabelsStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="bg-[#22272e] text-[#adbac7] h-screen rounded-md overflow-hidden">
      <QueryProvider>
        <Component {...pageProps} />
      </QueryProvider>
      <div id="portal-spinner" />
    </div>
  );
}

export default MyApp;
