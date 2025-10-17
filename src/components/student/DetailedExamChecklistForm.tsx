'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns-jalali';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, ClipboardTick, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistStatus } from '@/lib/types';


const checklistItemSchema = z.object({
  status: z.enum(["عالی", "خوب", "متوسط", "ضعیف"]),
  notes: z.string().optional(),
});

const formSchema = z.object({
  examName: z.string().min(1, "نام آزمون الزامی است."),
  examDate: z.date({ required_error: 'تاریخ آزمون الزامی است.' }),
  scientificPrep: z.object({
    summaryReview: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    markedQuestionsReview: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    timeManagementPlan: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    notes: z.string().optional(),
  }),
  mentalPrep: z.object({
    peaceOfMind: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    sleepQuality: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    nutrition: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    notes: z.string().optional(),
  }),
  logisticsPrep: z.object({
    pencil: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    eraser: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    card: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    watch: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    water: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    clothes: z.enum(["عالی", "خوب", "متوسط", "ضعیف"], { required_error: 'انتخاب وضعیت الزامی است.' }),
    notes: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const checklistOptions: ChecklistStatus[] = ["عالی", "خوب", "متوسط", "ضعیف"];

const ChecklistItem = ({ name, label, control }: { name: any, label: string, control: any }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="rounded-md border p-4">
        <FormLabel className="text-base">{label}</FormLabel>
        <FormControl>
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2"
          >
            {checklistOptions.map(option => (
              <FormItem key={option} className="flex items-center space-x-2 space-x-reverse">
                <FormControl>
                  <RadioGroupItem value={option} id={`${name}-${option}`} />
                </FormControl>
                <FormLabel htmlFor={`${name}-${option}`} className="font-normal">{option}</FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export function DetailedExamChecklistForm() {
  const { toast } = useToast();
  const { firestore, user, role } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const teacherId = role?.split(':')[1];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examName: '',
      examDate: new Date(),
      scientificPrep: { notes: '' },
      mentalPrep: { notes: '' },
      logisticsPrep: { notes: '' },
    },
  });

  async function onSubmit(data: FormValues) {
    if (!user || !teacherId) {
      toast({ title: "خطا", description: "اطلاعات کاربری برای ثبت فرم یافت نشد.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const checklistId = `${format(data.examDate, 'yyyy-MM-dd')}-${data.examName.replace(/\s+/g, '-')}`;
    const reportRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'detailedExamChecklists', checklistId);

    const checklistData = {
      id: checklistId,
      studentId: user.uid,
      ...data,
      createdAt: serverTimestamp(),
    };

    try {
      setDocumentNonBlocking(reportRef, checklistData, { merge: true });
      toast({ title: "چک‌لیست شما با موفقیت ثبت شد." });
      form.reset();
    } catch (error) {
      console.error("Error saving exam checklist: ", error);
      toast({ title: "خطا در ثبت چک‌لیست", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="bg-muted/30 border-none shadow-none">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3">
              <ClipboardTick className="h-7 w-7 text-primary" />
              چک‌لیست تفصیلی آمادگی آزمون
            </CardTitle>
            <CardDescription>
              این فرم به شما کمک می‌کند تا میزان آمادگی خود را قبل از هر آزمون در ابعاد مختلف بسنجید.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">اطلاعات آزمون</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="examName" render={({ field }) => (
              <FormItem>
                <FormLabel>نام آزمون</FormLabel>
                <FormControl><Input placeholder="مثال: آزمون قلمچی ۲۴ فروردین" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="examDate" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاریخ آزمون</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 pr-3 justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, 'PPP') : <span>یک تاریخ انتخاب کنید</span>}
                        <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Scientific Prep */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">بخش اول: آمادگی علمی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChecklistItem name="scientificPrep.summaryReview" label="مرور و جمع‌بندی خلاصه‌ها" control={form.control} />
            <ChecklistItem name="scientificPrep.markedQuestionsReview" label="مرور سوالات علامت‌دار" control={form.control} />
            <ChecklistItem name="scientificPrep.timeManagementPlan" label="برنامه‌ریزی برای مدیریت زمان" control={form.control} />
            <FormField control={form.control} name="scientificPrep.notes" render={({ field }) => (
              <FormItem><FormLabel>یادداشت‌های بخش علمی</FormLabel><FormControl><Textarea placeholder="نکات یا مشکلات این بخش را اینجا بنویسید..." {...field} /></FormControl></FormItem>
            )} />
          </CardContent>
        </Card>
        
        {/* Mental Prep */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">بخش دوم: آمادگی روحی-روانی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChecklistItem name="mentalPrep.peaceOfMind" label="آرامش و نداشتن استرس" control={form.control} />
            <ChecklistItem name="mentalPrep.sleepQuality" label="خواب کافی و باکیفیت شب قبل" control={form.control} />
            <ChecklistItem name="mentalPrep.nutrition" label="تغذیه مناسب روز قبل" control={form.control} />
            <FormField control={form.control} name="mentalPrep.notes" render={({ field }) => (
              <FormItem><FormLabel>یادداشت‌های بخش روانی</FormLabel><FormControl><Textarea placeholder="نکات یا مشکلات این بخش را اینجا بنویسید..." {...field} /></FormControl></FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Logistics Prep */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">بخش سوم: تدارکات و لجستیک آزمون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChecklistItem name="logisticsPrep.pencil" label="آماده بودن مداد مناسب" control={form.control} />
            <ChecklistItem name="logisticsPrep.eraser" label="آماده بودن پاک‌کن مناسب" control={form.control} />
            <ChecklistItem name="logisticsPrep.card" label="کارت ورود به جلسه" control={form.control} />
            <ChecklistItem name="logisticsPrep.watch" label="ساعت مچی" control={form.control} />
            <ChecklistItem name="logisticsPrep.water" label="بطری آب" control={form.control} />
            <ChecklistItem name="logisticsPrep.clothes" label="لباس مناسب و راحت" control={form.control} />
            <FormField control={form.control} name="logisticsPrep.notes" render={({ field }) => (
              <FormItem><FormLabel>یادداشت‌های بخش تدارکات</FormLabel><FormControl><Textarea placeholder="نکات یا مشکلات این بخش را اینجا بنویسید..." {...field} /></FormControl></FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            ثبت چک‌لیست
          </Button>
        </div>
      </form>
    </Form>
  );
}
