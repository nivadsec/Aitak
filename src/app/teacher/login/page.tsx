'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import React from 'react';


export default function TeacherLoginPage() {

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
