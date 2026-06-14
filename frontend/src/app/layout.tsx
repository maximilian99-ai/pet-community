import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pet Community',
  description: 'Share your pet\'s daily journey',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
  icons: {
    icon: [
      { url: '/pet_community_favicon.png', sizes: 'any', type: 'image/png'  }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
