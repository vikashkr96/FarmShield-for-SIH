import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../providers/LanguageProvider';
import { AuthProvider } from '../providers/AuthProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FarmShield - Digital Farm Management & MRL Portal',
  description: 'Digital farm management portal for Maximum Residue Limits (MRL) and Antimicrobial Usage (AMU) monitoring in livestock & aquaculture.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FDFDFD] text-gray-900 selection:bg-[#1B5E20] selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <div className="flex-1 flex flex-col">{children}</div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
