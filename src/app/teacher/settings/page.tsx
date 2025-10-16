'use client';

import { useFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, KeyRound, Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { copyToClipboard } from '@/lib/utils';

export default function TeacherSettingsPage() {
  const { user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  const handleCopy = () => {
    if (user?.uid) {
        copyToClipboard(user.uid).then((success) => {
            if (success) {
                setHasCopied(true);
                toast({ title: 'کد معلم کپی شد!' });
                setTimeout(() => setHasCopied(false), 2000);
            }
        });
    }
  };


  if (isUserLoading) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }
  
  if (!user) {
      return null; // or a redirect
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="bg-muted/30 border-none shadow-none">
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3">
                <Settings className="h-7 w-7 text-primary" />
                پروفایل و تنظیمات
            </CardTitle>
            <CardDescription>
                اطلاعات حساب کاربری خود را مشاهده و ویرایش کنید.
            </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            اطلاعات کاربری
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{user.displayName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            کد دعوت دانش‌آموز
          </CardTitle>
          <CardDescription>
            این کد را در اختیار دانش‌آموزان جدید قرار دهید تا هنگام ثبت‌نام به پنل شما متصل شوند.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
            <Input readOnly value={user.uid} className="font-mono bg-muted" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
                {hasCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            تغییر رمز عبور
          </CardTitle>
          <CardDescription>
            برای امنیت بیشتر، توصیه می‌شود هر چند وقت یکبار رمز عبور خود را تغییر دهید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">رمز عبور فعلی</Label>
            <Input id="current-password" type="password" />
          </div>
          <div>
            <Label htmlFor="new-password">رمز عبور جدید</Label>
            <Input id="new-password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm-password">تکرار رمز عبور جدید</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardContent>
          <Button>ذخیره تغییرات</Button>
        </CardContent>
      </Card>
    </div>
  );
}
