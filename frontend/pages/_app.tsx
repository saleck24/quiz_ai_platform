import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from 'next-i18next';

function App({ Component, pageProps }: AppProps) {
  return (
    <div className="dark min-h-screen">
      <div className="ai-mesh-bg" />
      <Component {...pageProps} />
    </div>
  );
}

export default appWithTranslation(App);
