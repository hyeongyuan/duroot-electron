import React from 'react';
import type { AppProps } from 'next/app';

import { QueryProvider } from '../providers/query-provider';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
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
