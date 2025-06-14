import React from 'react';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WalletConnectModal from '../components/WalletConnectModal';
import { WalletProvider } from './providers/WalletProvider';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {/* Demo Mode Banner */}
        <div className="w-full bg-red-600 text-white text-center py-2 text-sm font-semibold">
          This is a DEMO application. No real funds are used.
        </div>

        {/* WalletProvider wraps the entire application to provide global state */}
        <WalletProvider>
          <div className="min-h-screen bg-zinc-900 flex flex-col">
            <Header /> {/* Header now consumes state from WalletProvider */}
            <main className="flex-grow">
              {children} {/* This renders the current page, which now consumes state from WalletProvider */}
            </main>
            <Footer /> {/* Footer now consumes state from WalletProvider */}
            <WalletConnectModal /> {/* WalletConnectModal now consumes state from WalletProvider */}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
