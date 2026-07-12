import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'MFSA | Liquidity & Risk Intelligence',
  description: 'A responsible multi-provider agent operations decision-support prototype using synthetic data.',
};

const themeBoot = `(function(){try{var s=localStorage.getItem('mfsa-theme');var t=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-boot" strategy="beforeInteractive">
          {themeBoot}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
