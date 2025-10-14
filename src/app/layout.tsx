import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'سیستم گزارش‌کار هوشمند',
  description: 'Smart Calm Report System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="flex flex-col min-h-screen">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Yekan+Bakh:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex-1 flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster />
        <footer className="text-center p-4 text-sm text-muted-foreground">
          توسعه دهنده حسین طاهری
        </footer>
      </body>
    </html>
  );
}
