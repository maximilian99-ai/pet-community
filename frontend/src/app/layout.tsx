import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Pet Community',
  description: 'Share your pet\'s daily journey',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
