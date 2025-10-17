'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Send } from 'lucide-react';
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
import { initiatePasswordReset } from '@/firebase/non-blocking-login';

const formSchema = z.object({
  email: z.string().email('ایمیل وارد شده معتبر نیست.'),
});

type FormValues = z.infer<typeof formSchema>;

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: FormValues) {
    if (!auth) {
      toast({
        title: 'خطا در سیستم',
        description: 'سرویس احراز هویت در دسترس نیست.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await initiatePasswordReset(auth, data.email);
      toast({
        title: 'ایمیل ارسال شد',
        description: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفا صندوق ورودی (و اسپم) خود را بررسی کنید.',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      let description = 'مشکلی در ارسال ایمیل بازیابی پیش آمد.';
      if (error.code === 'auth/user-not-found') {
        description = 'حساب کاربری با این ایمیل یافت نشد.';
      }
      toast({
        title: 'خطا',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل</FormLabel>
              <FormControl>
                <Input placeholder="student@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
            ارسال لینک بازیابی
          </Button>
        </div>
      </form>
    </Form>
  );
}
