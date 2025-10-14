'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { FirebaseClientProvider, useAuth, initiateAnonymousSignIn, useUser } from '@/firebase';

function LoginPageContent() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Automatically sign in the user anonymously if not already signed in.
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);
  
  // This is a simple role-based redirect. In a real app, you'd
  // likely have a more sophisticated way of determining roles.
  useEffect(() => {
    if (user && user.email) { // Anonymouse users do not have emails
      if(user.photoURL === 'teacher'){
         router.push('/teacher/dashboard');
      } else {
         router.push('/student/dashboard');
      }
    }
  }, [user, router]);


  if (isUserLoading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Logo className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }


  return (
     <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(116,188,198,0.2),transparent)]"></div></div>
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="items-center text-center">
          <Logo className="mb-4 h-12 w-12 text-primary" />
          <CardTitle className="font-headline text-2xl">سیستم گزارش‌کار هوشمند</CardTitle>
          <CardDescription className="pt-2">
            به پلتفرم خودارزیابی و نظم شخصی خوش آمدید.
            <br />
            نقش خود را برای ورود انتخاب کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Button asChild size="lg" className="h-12">
              <Link href="/student/dashboard">
                <ArrowLeft className="ml-2 h-5 w-5" />
                ورود به پنل دانش‌آموز
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-12">
              <Link href="/teacher/dashboard">
                <ArrowLeft className="ml-2 h-5 w-5" />
                ورود به پنل معلم
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}


export default function LoginPage() {
  return (
    <FirebaseClientProvider>
      <LoginPageContent />
    </FirebaseClientProvider>
  )
}
