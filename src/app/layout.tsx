import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'آی‌تاب',
  description: 'آی‌تاب | پلتفرم هوشمند خودارزیابی و نظم شخصی',
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
        <footer className="bg-muted/50 border-t">
          <div className="container mx-auto py-6 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center md:text-right">
                    © 1403 آی‌تاب. تمام حقوق محفوظ است.
                </p>
                <p className="text-sm text-muted-foreground text-center md:text-left">
                    طراحی و توسعه توسط <span className="font-semibold text-foreground">حسین طاهری</span>
                </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
