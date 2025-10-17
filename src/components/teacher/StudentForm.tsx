'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Save, Loader2, Bot, BarChart3, Calendar, FileText, BookCopy, ClipboardPen, BrainCircuit, Map, ClipboardCheck, ClipboardEdit, ClipboardList } from 'lucide-react';
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
import { ScrollArea } from '../ui/scroll-area';


const formSchema = z.object({
  firstName: z.string().min(2, 'نام الزامی است.'),
  lastName: z.string().min(2, 'نام خانوادگی الزامی است.'),
  email: z.string().email('ایمیل معتبر نیست.'),
  gradeLevel: z.string().min(1, 'پایه تحصیلی الزامی است.'),
  major: z.string().min(1, 'رشته تحصیلی الزامی است.'),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
  // Feature flags
  assistantEnabled: z.boolean().default(true),
  canViewStats: z.boolean().default(true),
  canViewSchedule: z.boolean().default(true),
  canSubmitDailyReport: z.boolean().default(true),
  canViewQuestionnaires: z.boolean().default(true),
  canViewTests: z.boolean().default(true),
  canSubmitWeeklyReport: z.boolean().default(true),
  canSubmitExamAnalysis: z.boolean().default(true),
  canSubmitFocusLadder: z.boolean().default(true),
  canSubmitTopicInvestment: z.boolean().default(true),
  canViewStrategicPlans: z.boolean().default(true),
  canViewConsultingContent: z.boolean().default(true),
  canSubmitOverallExamAnalysis: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  student?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const permissionFields: { key: keyof FormValues, label: string, icon: React.ElementType }[] = [
    { key: 'assistantEnabled', label: 'ربات هوشمند', icon: Bot },
    { key: 'canViewStats', label: 'آمار عملکرد', icon: BarChart3 },
    { key: 'canViewSchedule', label: 'برنامه کلاسی', icon: Calendar },
    { key: 'canViewTests', label: 'آزمون‌های آنلاین', icon: ClipboardList },
    { key: 'canViewQuestionnaires', label: 'پرسشنامه‌ها', icon: FileText },
    { key: 'canSubmitDailyReport', label: 'گزارش روزانه', icon: ClipboardEdit },
    { key: 'canSubmitWeeklyReport', label: 'گزارش هفتگی', icon: BookCopy },
    { key: 'canSubmitExamAnalysis', label: 'تحلیل آزمون', icon: ClipboardPen },
    { key: 'canSubmitOverallExamAnalysis', label: 'تحلیل کلی آزمون', icon: ClipboardCheck },
    { key: 'canSubmitFocusLadder', label: 'نردبان تمرکز', icon: BrainCircuit },
    { key: 'canSubmitTopicInvestment', label: 'روندنمای درسی', icon: Map },
    { key: 'canViewStrategicPlans', label: 'برنامه‌های راهبردی', icon: BarChart3 },
    { key: 'canViewConsultingContent', label: 'محتوای مشاوره‌ای', icon: BookCopy },
];


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
      assistantEnabled: student?.assistantEnabled ?? true,
      canViewStats: student?.canViewStats ?? true,
      canViewSchedule: student?.canViewSchedule ?? true,
      canSubmitDailyReport: student?.canSubmitDailyReport ?? true,
      canViewQuestionnaires: student?.canViewQuestionnaires ?? true,
      canViewTests: student?.canViewTests ?? true,
      canSubmitWeeklyReport: student?.canSubmitWeeklyReport ?? true,
      canSubmitExamAnalysis: student?.canSubmitExamAnalysis ?? true,
      canSubmitFocusLadder: student?.canSubmitFocusLadder ?? true,
      canSubmitTopicInvestment: student?.canSubmitTopicInvestment ?? true,
      canViewStrategicPlans: student?.canViewStrategicPlans ?? true,
      canViewConsultingContent: student?.canViewConsultingContent ?? true,
      canSubmitOverallExamAnalysis: student?.canSubmitOverallExamAnalysis ?? true,
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
        <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
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

                <div className="space-y-2 pt-4">
                    <Label>دسترسی به قابلیت‌ها</Label>
                     {permissionFields.map(({ key, label, icon: Icon }) => (
                         <FormField
                            key={key}
                            control={form.control}
                            name={key as keyof FormValues}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label htmlFor={`switch-${key}`} className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        {label}
                                    </Label>
                                </div>
                                <FormControl>
                                    <Switch
                                        id={`switch-${key}`}
                                        checked={field.value as boolean}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </div>
        </ScrollArea>
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
