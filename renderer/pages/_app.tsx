import React from 'react';
import type { AppProps } from 'next/app';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-[#22272e] text-[#adbac7] h-screen rounded-md overflow-hidden">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
