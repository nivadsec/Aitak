import { SignUpForm } from '@/components/auth/SignUpForm';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(116,188,198,0.2),transparent)]"></div></div>
    <Card className="w-full max-w-lg shadow-2xl shadow-primary/10">
        <CardHeader className="items-center text-center">
        <Link href="/">
            <Logo className="mb-4 h-12 w-12 text-primary" />
        </Link>
        <CardTitle className="font-headline text-2xl">ایجاد حساب کاربری جدید</CardTitle>
        <CardDescription className="pt-2">
            اطلاعات خود را برای ثبت‌نام در سیستم وارد کنید.
        </CardDescription>
        </CardHeader>
        <CardContent>
            <SignUpForm />
             <div className="mt-6 text-center text-sm">
                حساب کاربری دارید؟{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    وارد شوید
                </Link>
            </div>
             <div className="mt-4 text-center text-sm">
                <Link href="/" className="font-semibold text-primary hover:underline flex items-center justify-center gap-1">
                    <Home className="h-4 w-4" />
                    بازگشت به صفحه اصلی
                </Link>
            </div>
        </CardContent>
    </Card>
    </main>
  );
}
