'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/icons/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { useFirebase, useAuth, setDocumentNonBlocking, initiateTeacherSignUp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import React from 'react';
import { Loader2 } from 'lucide-react';


export default function TeacherLoginPage() {
  const { firestore } = useFirebase();
  const auth = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = React.useState(false);
  const [showCreateButton, setShowCreateButton] = React.useState(true);

  // This effect will run once on mount to check if the admin account exists
  // and hide the create button if it does.
  React.useEffect(() => {
    async function checkAdminExists() {
        if (!firestore) return;
        const teacherRef = doc(firestore, 'teachers', 'default-teacher');
        try {
            const docSnap = await (await import('firebase/firestore')).getDoc(teacherRef);
            if (docSnap.exists()) {
                setShowCreateButton(false);
            }
        } catch (e) {
            // Errors are expected if not logged in, etc.
            // We can safely assume the button should be shown if we can't check.
            console.warn("Could not check for admin user:", e);
        }
    }
    checkAdminExists();
  }, [firestore]);


  const handleCreateDefaultTeacher = async () => {
    if (!auth || !firestore) {
      toast({ title: 'سرویس Firebase در دسترس نیست.', variant: 'destructive' });
      return;
    }
    setIsCreating(true);

    const email = 'admin@example.com';
    const password = 'password';

    try {
        // Step 1: Create the user in Firebase Auth
        const userCredential = await initiateTeacherSignUp(auth, email, password);
        const user = userCredential.user;
        
        // Step 2: Create the teacher document in Firestore
        const teacherRef = doc(firestore, 'teachers', 'default-teacher');
        setDocumentNonBlocking(teacherRef, {
            id: 'default-teacher', // Using a fixed ID for the single teacher/admin
            firstName: 'مدیر',
            lastName: 'سیستم',
            email: user.email,
        }, { merge: true });

        toast({
            title: 'حساب مدیر ایجاد شد',
            description: 'اکنون با ایمیل admin@example.com و رمز عبور password وارد شوید.',
        });
        setShowCreateButton(false); // Hide button after successful creation
    } catch (error: any) {
        console.error("Error creating default teacher:", error);
        if (error.code === 'auth/email-already-in-use') {
             toast({
                title: 'حساب مدیر از قبل وجود دارد',
                description: 'لطفا با اطلاعات کاربری خود وارد شوید.',
                variant: 'destructive',
            });
            setShowCreateButton(false);
        } else {
            toast({
                title: 'خطا در ایجاد حساب',
                description: 'مشکلی در هنگام ایجاد حساب مدیر پیش آمد.',
                variant: 'destructive',
            });
        }
    } finally {
        setIsCreating(false);
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
             <div className="mt-6 text-center text-sm">
                <Link href="/" className="font-semibold text-primary hover:underline">
                    بازگشت به صفحه اصلی
                </Link>
            </div>
             {showCreateButton && (
              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                          برای اولین بار
                      </span>
                  </div>
              </div>
            )}
            {showCreateButton && (
                 <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleCreateDefaultTeacher}
                    disabled={isCreating}
                  >
                    {isCreating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    ایجاد حساب مدیر پیش‌فرض
                </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
