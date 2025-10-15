'use client';

import Link from 'next/link';
import { UserPlus, Megaphone } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { FirebaseClientProvider, useAuth, initiateAnonymousSignIn, useUser, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Separator } from '@/components/ui/separator';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginForm } from '@/components/auth/LoginForm';

function AnnouncementCard() {
  const { firestore } = useFirebase();

  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('timestamp', 'desc'), limit(1));
  }, [firestore]);

  const { data: announcements, isLoading } = useCollection(announcementsQuery);
  const latestAnnouncement = announcements?.[0];

  if (isLoading) {
    return (
      <Card className="mt-6 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardContent>
      </Card>
    )
  }

  if (!latestAnnouncement) {
    return null; // Don't render anything if there are no announcements
  }
  
  return (
    <Card className="mt-6 animate-fade-in-up bg-secondary/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-lg text-primary">
          <Megaphone className="h-5 w-5" />
          اطلاعیه مهم
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {latestAnnouncement.content}
        </p>
         <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
          تاریخ انتشار: {new Date((latestAnnouncement.timestamp as any)?.seconds * 1000).toLocaleDateString('fa-IR')}
        </p>
      </CardContent>
    </Card>
  )
}

function LoginPageContent() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Automatically sign in the user anonymously if not already signed in.
  // This is useful for public pages that might read public data, but we
  // will redirect authenticated users away from this page.
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);
  
  // This is a simple role-based redirect.
  useEffect(() => {
    if (user && user.email) { // Anonymous users do not have emails
      if(user.photoURL === 'teacher'){
         router.push('/teacher/dashboard');
      } else {
         router.push('/student/dashboard');
      }
    }
  }, [user, router]);


  if (isUserLoading || (user && user.email)) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Logo className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }


  return (
     <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(116,188,198,0.2),transparent)]"></div></div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader className="items-center text-center">
            <Logo className="mb-4 h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-2xl">آی‌تاب</CardTitle>
            <CardDescription className="pt-2">
              به آی‌تاب خوش آمدید. پلتفرم هوشمند خودارزیابی و نظم شخصی.
              <br />
              برای ورود، ایمیل و رمز عبور خود را وارد کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                    یا
                </span>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/signup">
                <UserPlus className="ml-2 h-5 w-5" />
                ایجاد حساب کاربری جدید (دانش‌آموز)
              </Link>
            </Button>
          </CardContent>
        </Card>
        <AnnouncementCard />
      </div>
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
