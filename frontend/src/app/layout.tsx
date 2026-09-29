import type { Metadata } from 'next';
import { Poppins, Share_Tech_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../providers/LanguageProvider';
import { AuthProvider } from '../providers/AuthProvider';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const shareTechMono = Share_Tech_Mono({
  variable: '--font-share-tech-mono',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FarmShield (फार्मशील्ड) - National Digital Livestock Surveillance & MRL Compliance',
  description: 'National Digital Livestock Surveillance, Animal Health Intelligence, and MRL Compliance Decision Support Platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${shareTechMono.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#0E4D2B] selection:text-white font-sans">
        <LanguageProvider>
          <AuthProvider>
            <div className="flex-1 flex flex-col">{children}</div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
