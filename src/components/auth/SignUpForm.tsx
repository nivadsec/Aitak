'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { createStudentAuth } from '@/app/actions/update-password';
import { setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';


const formSchema = z.object({
  firstName: z.string().min(2, 'نام الزامی است.'),
  lastName: z.string().min(2, 'نام خانوادگی الزامی است.'),
  email: z.string().email('ایمیل معتبر نیست.'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.'),
  gradeLevel: z.enum(['دهم', 'یازدهم', 'دوازدهم'], {
    required_error: 'انتخاب پایه تحصیلی الزامی است.',
  }),
  major: z.enum(['انسانی', 'تجربی', 'ریاضی'], {
    required_error: 'انتخاب رشته تحصیلی الزامی است.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ADMIN_TEACHER_ID = "05OiQevVDkNy9MmhveRs9h2w81y2";

export function SignUpForm() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: FormValues) {
    if (!firestore) {
        toast({
            title: 'خطای سیستم',
            description: 'سرویس‌های مورد نیاز بارگذاری نشده‌اند. لطفا دوباره تلاش کنید.',
            variant: 'destructive',
        });
        return;
    }
    setIsLoading(true);

    try {
        const teacherId = ADMIN_TEACHER_ID;
        
        // Step 1: Create Auth user and Firestore profile via Server Action
        const authResult = await createStudentAuth(
            data.email,
            data.password,
            `${data.firstName} ${data.lastName}`,
            teacherId
        );

        if (!authResult.success || !authResult.uid) {
            throw new Error(authResult.error || 'خطا در ایجاد حساب کاربری');
        }

        const studentUid = authResult.uid;
        
        // Step 2: Create the student document in Firestore
        const studentRef = doc(firestore, 'teachers', teacherId, 'students', studentUid);
        const studentData = {
            id: studentUid,
            teacherId: teacherId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            gradeLevel: data.gradeLevel,
            major: data.major,
            isActive: true,
            assistantEnabled: true,
            canViewDailyAnalysis: true,
            canViewStats: true,
            canViewSchedule: true,
            canSubmitDailyReport: true,
            canViewQuestionnaires: true,
            canViewTests: true,
            canSubmitWeeklyReport: true,
            canSubmitExamAnalysis: true,
            canSubmitFocusLadder: true,
            canSubmitTopicInvestment: true,
            canViewStrategicPlans: true,
            canViewConsultingContent: true,
            canSubmitOverallExamAnalysis: true,
            canSubmitDetailedExamChecklist: true,
        };

        // We use setDocumentNonBlocking because the security rules will handle validation.
        // The user doesn't need to wait for this to finish.
        setDocumentNonBlocking(studentRef, studentData, { merge: true });

        toast({
            title: 'ثبت‌نام موفق',
            description: 'حساب کاربری شما ایجاد شد. لطفاً از صفحه ورود وارد شوید.',
            className: 'font-body',
        });

        setIsSuccess(true);
    } catch (error: any) {
        console.error('Error signing up:', error);
        let description = 'مشکلی در هنگام ثبت‌نام پیش آمد. لطفاً دوباره تلاش کنید.';
        if (error.message.includes('auth/email-already-exists') || error.message.includes('این ایمیل قبلاً در سیستم ثبت شده است')) {
            description = 'این ایمیل قبلاً در سیستم ثبت شده است.';
        } else if (error.message.includes('auth/invalid-email')) {
            description = 'فرمت ایمیل وارد شده صحیح نیست.';
        } else {
            description = error.message;
        }
        toast({
            title: 'خطا در ثبت‌نام',
            description,
            variant: 'destructive',
            className: 'font-body',
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
        <Alert variant="default" className="bg-green-50 border-green-200">
            <UserPlus className="h-4 w-4 !text-green-600" />
            <AlertTitle className="font-headline text-green-800">ثبت‌نام با موفقیت انجام شد!</AlertTitle>
            <AlertDescription className="text-green-700">
                حساب کاربری شما ایجاد شد. اکنون می‌توانید از <Link href="/login" className="font-bold hover:underline">صفحه ورود</Link> وارد پنل خود شوید.
            </AlertDescription>
        </Alert>
    )
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
                <Input placeholder="student@example.com" {...field} />
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
              <FormLabel>رمز عبور</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="پایه را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="دهم">دهم</SelectItem>
                      <SelectItem value="یازدهم">یازدهم</SelectItem>
                      <SelectItem value="دوازدهم">دوازدهم</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="رشته را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="تجربی">تجربی</SelectItem>
                      <SelectItem value="ریاضی">ریاضی</SelectItem>
                      <SelectItem value="انسانی">انسانی</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="ml-2 h-4 w-4" />
            )}
            ایجاد حساب کاربری
          </Button>
        </div>
      </form>
    </Form>
  );
}
