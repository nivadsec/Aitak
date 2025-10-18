'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, LogIn } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase/provider';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { ROLES } from '@/lib/roles';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ResetPasswordForm } from './ResetPasswordForm';

const formSchema = z.object({
  email: z.string().email('ایمیل وارد شده معتبر نیست.'),
  password: z.string().min(1, 'رمز عبور الزامی است.'),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  role: typeof ROLES.STUDENT | typeof ROLES.TEACHER;
}

export function LoginForm({ role }: LoginFormProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const [isResetOpen, setIsResetOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: FormValues) {
    if (!auth) {
      toast({
        title: 'عدم ارتباط با سرور',
        description: 'اتصال به Firebase هنوز برقرار نشده است.',
        variant: 'destructive',
        className: 'font-body',
      });
      return;
    }

    try {
      await initiateEmailSignIn(auth, data.email, data.password);
      // On successful login, the onAuthStateChanged listener in FirebaseProvider
      // will handle user state updates and redirects.
    } catch (error: any) {
      console.error('Login Error:', error);
      let description = 'مشکلی در هنگام ورود پیش آمد. لطفاً دوباره تلاش کنید.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        description = 'ایمیل یا رمز عبور وارد شده صحیح نمی‌باشد.';
      } else if (error.code === 'auth/user-disabled') {
         description = 'حساب کاربری شما غیرفعال شده است. لطفاً با مدیر خود تماس بگیرید.'
      }
      toast({
        title: 'خطا در ورود',
        description,
        variant: 'destructive',
        className: 'font-body',
      });
       // Reload to clear any anonymous user state
       window.location.reload();
    }
  }

  return (
    <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ایمیل</FormLabel>
                <FormControl>
                  <Input placeholder={role === ROLES.TEACHER ? "teacher@example.com" : "student@example.com"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>رمز عبور</FormLabel>
                    {role === ROLES.STUDENT && (
                        <DialogTrigger asChild>
                            <Button variant="link" size="sm" type="button" className="text-xs h-auto p-0">
                                فراموشی رمز عبور؟
                            </Button>
                        </DialogTrigger>
                    )}
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="ml-2 h-4 w-4" />
              )}
              ورود
            </Button>
          </div>
        </form>
      </Form>
      
      <DialogContent>
          <DialogHeader>
              <DialogTitle className="font-headline">بازیابی رمز عبور</DialogTitle>
              <DialogDescription>
                  ایمیل حساب کاربری خود را وارد کنید تا لینک بازیابی رمز عبور برایتان ارسال شود.
              </DialogDescription>
          </DialogHeader>
          <ResetPasswordForm onSuccess={() => setIsResetOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
