'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateStudentPassword } from '@/app/actions/update-password';

const formSchema = z.object({
  newPassword: z.string().min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'رمزهای عبور با یکدیگر مطابقت ندارند.',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof formSchema>;

interface ChangePasswordFormProps {
  studentId: string;
  onSuccess: () => void;
}

export function ChangePasswordForm({ studentId, onSuccess }: ChangePasswordFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const result = await updateStudentPassword(studentId, data.newPassword);
      if (result.success) {
        toast({
          title: 'موفقیت',
          description: 'رمز عبور دانش‌آموز با موفقیت تغییر کرد.',
        });
        onSuccess();
      } else {
        throw new Error(result.error || 'یک خطای ناشناخته رخ داد');
      }
    } catch (error: any) {
      console.error('Password Change Error:', error);
      toast({
        title: 'خطا در تغییر رمز عبور',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رمز عبور جدید</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تکرار رمز عبور جدید</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            ذخیره رمز جدید
          </Button>
        </div>
      </form>
    </Form>
  );
}
