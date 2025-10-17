'use client';

import React from 'react';
import { useDoc, useFirebase, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, ArrowLeft, Bot, BarChart3, Calendar, FileText, BookCopy, ClipboardPen, BrainCircuit, Map, ClipboardCheck, ClipboardEdit, ClipboardList, BookOpen, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureToggleProps {
  student: Student;
  featureKey: keyof Student;
  label: string;
  description: string;
  icon: React.ElementType;
}

function FeatureToggle({ student, featureKey, label, description, icon: Icon }: FeatureToggleProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    if (!user) return;
    const studentRef = doc(firestore, 'teachers', user.uid, 'students', student.id);
    updateDocumentNonBlocking(studentRef, { [featureKey]: checked });
    toast({
      title: 'دسترسی تغییر کرد',
      description: `ویژگی «${label}» برای این دانش‌آموز ${checked ? 'فعال' : 'غیرفعال'} شد.`,
    });
  };

  const isChecked = !!student[featureKey];

  return (
    <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
      <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-primary mt-1" />
        <div className="flex flex-col">
          <Label htmlFor={`switch-${featureKey}`} className="text-base font-medium leading-none">
            {label}
          </Label>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
      </div>
      <Switch
        id={`switch-${featureKey}`}
        checked={isChecked}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}

export default function StudentSettingsPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const id = params.id;

  const studentRef = useMemoFirebase(() => {
    if (!user || !id) return null;
    return doc(firestore, 'teachers', user.uid, 'students', id);
  }, [firestore, user, id]);

  const { data: student, isLoading } = useDoc<Student>(studentRef);
  
  const features: Omit<FeatureToggleProps, 'student'>[] = [
    { featureKey: 'assistantEnabled', label: 'ربات هوشمند', description: 'فعال‌سازی ربات مشاور هوشمند در پنل دانش‌آموز.', icon: Bot },
    { featureKey: 'canViewDailyAnalysis', label: 'پایش هوشمند روزانه', description: 'نمایش کارت تحلیل AI در داشبورد اصلی.', icon: Brain },
    { featureKey: 'canViewStats', label: 'آمار عملکرد', description: 'نمایش صفحه آمار و نمودارهای عملکرد فردی.', icon: BarChart3 },
    { featureKey: 'canViewSchedule', label: 'برنامه کلاسی', description: 'نمایش صفحه برنامه کلاسی و جلسات مشاوره.', icon: Calendar },
    { featureKey: 'canViewStrategicPlans', label: 'برنامه راهبردی', description: 'امکان مشاهده و دانلود برنامه‌های راهبردی آزمون.', icon: Map },
    { featureKey: 'canViewTests', label: 'آزمون‌های آنلاین', description: 'امکان شرکت در آزمون‌های آنلاین درسی.', icon: ClipboardList },
    { featureKey: 'canViewQuestionnaires', label: 'پرسشنامه‌ها', description: 'امکان شرکت در پرسشنامه‌های غیردرسی (هوش و...).', icon: FileText },
    { featureKey: 'canSubmitDailyReport', label: 'گزارش روزانه', description: 'اجازه ثبت و ارسال فرم گزارش روزانه.', icon: ClipboardEdit },
    { featureKey: 'canSubmitWeeklyReport', label: 'گزارش هفتگی', description: 'اجازه ثبت و ارسال فرم گزارش پیشرفت هفتگی.', icon: BookCopy },
    { featureKey: 'canSubmitExamAnalysis', label: 'تحلیل آزمون عددمحور', description: 'اجازه ثبت و ارسال فرم تحلیل آزمون عددمحور.', icon: ClipboardPen },
    { featureKey: 'canSubmitOverallExamAnalysis', label: 'تحلیل آزمون کلی', description: 'اجازه ثبت فرم تحلیل آزمون کلی.', icon: ClipboardCheck },
    { featureKey: 'canSubmitFocusLadder', label: 'نردبان تمرکز', description: 'امکان ثبت امتیاز در نردبان و نمودار تمرکز.', icon: BrainCircuit },
    { featureKey: 'canSubmitTopicInvestment', label: 'روندنمای درسی', description: 'اجازه ثبت فرم روندنمای برنامه‌ریزی درسی.', icon: BarChart3 },
    { featureKey: 'canViewConsultingContent', label: 'محتوای مشاوره‌ای', description: 'امکان مشاهده محتوای مشاوره‌ای (مقالات و ویدیوها).', icon: BookOpen },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="bg-muted/30 border-none shadow-none">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(features.length)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-muted/30 border-none shadow-none">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <Settings className="h-7 w-7 text-primary" />
            تنظیمات دسترسی برای {student.firstName} {student.lastName}
          </CardTitle>
          <CardDescription>
            در این بخش می‌توانید قابلیت‌های مختلف پنل را برای این دانش‌آموز فعال یا غیرفعال کنید.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">مدیریت قابلیت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature) => (
            <FeatureToggle key={feature.featureKey} student={student} {...feature} />
          ))}
        </CardContent>
         <CardContent>
             <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="ml-2 h-4 w-4" />
                بازگشت
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
