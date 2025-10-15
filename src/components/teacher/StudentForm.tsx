'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Save, Loader2 } from 'lucide-react';
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
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirebase } from '@/firebase/provider';
import { collection, doc } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const formSchema = z.object({
  firstName: z.string().min(2, 'نام الزامی است.'),
  lastName: z.string().min(2, 'نام خانوادگی الزامی است.'),
  email: z.string().email('ایمیل معتبر نیست.'),
  gradeLevel: z.string().min(1, 'پایه تحصیلی الزامی است.'),
  major: z.string().min(1, 'رشته تحصیلی الزامی است.'),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  student?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);

  const isEditMode = !!student;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      email: student?.email || '',
      gradeLevel: student?.gradeLevel || '',
      major: student?.major || '',
      password: '',
      isActive: student?.isActive ?? true,
    },
  });

  async function onSubmit(data: FormValues) {
    if (!user) {
        toast({
            title: "خطا",
            description: "برای انجام این عملیات باید وارد شده باشید.",
            variant: "destructive",
            className: 'font-body',
        });
        return;
    }
    setIsLoading(true);

    try {
        if (isEditMode && student) {
            const studentRef = doc(firestore, 'teachers', user.uid, 'students', student.id);
            // We don't update password or email here as it requires special handling
            const { password, email, ...updateData } = data;
            setDocumentNonBlocking(studentRef, updateData, { merge: true });
            toast({
                title: "موفق",
                description: "اطلاعات دانش‌آموز با موفقیت به‌روزرسانی شد.",
                className: 'font-body',
            });
        } else {
            // Note: In a real app, creating a user should be a secure backend operation.
            // This is a simplified client-side example.
            const studentsCollection = collection(firestore, 'teachers', user.uid, 'students');
            // A real ID would be the UID from Firebase Auth, here we generate a placeholder.
            const newDocRef = doc(studentsCollection);
            const studentData: Student = {
                id: newDocRef.id, // using the generated doc id
                teacherId: user.uid,
                ...data
            };
            setDocumentNonBlocking(newDocRef, studentData, {});
            toast({
                title: "دانش‌آموز اضافه شد",
                description: "دانش‌آموز جدید با موفقیت در سیستم ثبت شد.",
                className: 'font-body',
            });
        }
        onSuccess();
    } catch (error: any) {
        console.error("Error saving student:", error);
        toast({
            title: "خطا در ذخیره‌سازی",
            description: error.message || "مشکلی در هنگام ذخیره اطلاعات پیش آمد.",
            variant: "destructive",
            className: 'font-body',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>نام</FormLabel>
                <FormControl>
                    <Input placeholder="مثال: سارا" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>نام خانوادگی</FormLabel>
                <FormControl>
                    <Input placeholder="مثال: رضایی" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل</FormLabel>
              <FormControl>
                <Input placeholder="student@example.com" {...field} disabled={isEditMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="gradeLevel"
            render={({ field }) => (
                <FormItem>
                <FormLabel>پایه تحصیلی</FormLabel>
                <FormControl>
                    <Input placeholder="مثال: دهم" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
                <FormItem>
                <FormLabel>رشته</FormLabel>
                <FormControl>
                    <Input placeholder="مثال: تجربی" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        {!isEditMode && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رمز عبور اولیه</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="isActiveSwitch">وضعیت پنل</Label>
                    <p className="text-xs text-muted-foreground">
                        برای دسترسی دانش‌آموز به پنل خود، این گزینه را فعال کنید.
                    </p>
                </div>
                <FormControl>
                    <Switch
                        id="isActiveSwitch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                </FormControl>
                </FormItem>
            )}
        />

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                انصراف
            </Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            {isEditMode ? 'ذخیره تغییرات' : 'ایجاد دانش‌آموز'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
