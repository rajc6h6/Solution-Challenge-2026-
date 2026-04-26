import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'CASCADE — Autonomous Supply Chain AI Agent',
  description: 'CASCADE: Autonomous Agentic Supply Chain Disruption Prevention on Google Cloud. Powered by Gemini 2.5 Flash, Cloud Functions, and Firestore.',
  keywords: ['supply chain', 'AI', 'autonomous agent', 'Google Cloud', 'Gemini', 'CASCADE'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-obsidian text-white antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
