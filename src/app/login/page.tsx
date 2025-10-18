
'use client';

import Link from 'next/link';
import { UserPlus, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { useUser } from '@/firebase';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const [showLoading, setShowLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    // Show loading screen as long as Firebase is checking the auth state.
    if (!isUserLoading) {
      // If there is a logged-in (non-anonymous) user, the provider will redirect.
      // Keep the loading screen on to prevent flicker during redirect.
      if (user && !user.isAnonymous) {
        setShowLoading(true);
      } else {
        // If there's no user or an anonymous user, show the login page.
        setShowLoading(false);
      }
    }
  }, [isUserLoading, user]);

  // This effect ensures Math.random is only called on the client after mount, preventing hydration errors.
  useEffect(() => {
    setProgressValue(Math.floor(Math.random() * 100));
  }, []);


  if (showLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background gap-6">
          <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <Logo className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className='w-64 text-center space-y-4'>
            <p className="text-sm text-muted-foreground animate-pulse flex items-center justify-center gap-2">
                در حال بارگذاری...
            </p>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>
    );
  }

  return (
     <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(116,188,198,0.2),transparent)]"></div></div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader className="items-center text-center">
            <Link href="/">
              <Logo className="mb-4 h-12 w-12 text-primary" />
            </Link>
            <CardTitle className="font-headline text-2xl">ورود دانش‌آموز</CardTitle>
            <CardDescription className="pt-2">
              به آی‌تاب خوش آمدید. برای ورود، ایمیل و رمز عبور خود را وارد کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm role="student" />
            <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                    یا
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/signup">
                  <UserPlus className="ml-2 h-5 w-5" />
                  ایجاد حساب دانش‌آموزی
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/teacher/login">
                  <ShieldCheck className="ml-2 h-5 w-5" />
                  ورود معلمان
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
