
'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { initiateTeacherAnonymousSignIn } from '@/firebase/non-blocking-login-teacher';
import { UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TeacherLoginPage() {
    const auth = useAuth();
    const { toast } = useToast();

    const handleAnonymousTeacherLogin = async () => {
        if (!auth) {
            toast({
                title: 'خطا',
                description: 'سرویس احراز هویت هنوز آماده نیست. لطفا لحظه‌ای صبر کرده و دوباره تلاش کنید.',
                variant: 'destructive',
            });
            return;
        }
        try {
            await initiateTeacherAnonymousSignIn(auth);
            // The onAuthStateChanged listener in FirebaseProvider will handle the redirect.
        } catch (error) {
            console.error('Anonymous teacher login failed:', error);
            toast({
                title: 'خطا در ورود',
                description: 'ورود با حساب پیش‌فرض با مشکل مواجه شد.',
                variant: 'destructive',
            });
        }
    };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(116,188,198,0.2),transparent)]"></div></div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader className="items-center text-center">
            <Logo className="mb-4 h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-2xl">ورود معلم / مدیر</CardTitle>
            <CardDescription className="pt-2">
              برای ورود به پنل مدیریت، ایمیل و رمز عبور خود را وارد کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm role={ROLES.TEACHER} />
             <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                    یا
                </span>
            </div>
             <Button variant="secondary" className="w-full" onClick={handleAnonymousTeacherLogin}>
                <UserCog className="ml-2 h-5 w-5" />
                ورود با حساب پیش‌فرض معلم
            </Button>
             <div className="mt-6 text-center text-sm">
                <Link href="/" className="font-semibold text-primary hover:underline">
                    بازگشت به صفحه اصلی
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
