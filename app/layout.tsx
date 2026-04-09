import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDV Mercado',
  description: 'Sistema de Ponto de Venda para pequenos mercados',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-screen-xl p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
      </body>
    </html>
  );
}
