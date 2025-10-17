'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardEdit, PlusCircle, Save, Trash2, CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns-jalali';
import { Slider } from '../ui/slider';

const subjectItemSchema = z.object({
  subject: z.string().min(1, 'نام درس الزامی است.'),
  topic: z.string().min(1, 'مبحث الزامی است.'),
  studyTime: z.coerce.number().min(0, 'زمان مطالعه نمی‌تواند منفی باشد.'),
  totalTestQuestions: z.coerce.number().min(0),
  correctTestQuestions: z.coerce.number().min(0),
  incorrectTestQuestions: z.coerce.number().min(0),
  testTime: z.coerce.number().min(0),
});

const formSchema = z.object({
  date: z.date({ required_error: 'تاریخ الزامی است.' }),
  wakeUpTime: z.string().min(1, 'زمان بیداری الزامی است.'),
  studyStartTime: z.string().min(1, 'زمان شروع مطالعه الزامی است.'),
  studyEndTime: z.string().min(1, 'زمان پایان مطالعه الزامی است.'),
  minutesOfClasses: z.coerce.number().min(0, 'زمان کلاس نمی‌تواند منفی باشد.'),
  sleepAmount: z.coerce.number().min(0, 'میزان خواب نمی‌تواند منفی باشد.'),
  disasterLevel: z.number().min(0).max(10).default(5),
  minutesOfMobileUsage: z.coerce.number().min(0, 'زمان استفاده از موبایل نمی‌تواند منفی باشد.'),
  items: z.array(subjectItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function DailyReportForm() {
  const { toast } = useToast();
  const { firestore, user, role } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const teacherId = role?.split(':')[1];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      wakeUpTime: '',
      studyStartTime: '',
      studyEndTime: '',
      minutesOfClasses: 0,
      sleepAmount: 0,
      disasterLevel: 5,
      minutesOfMobileUsage: 0,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  async function onSubmit(data: FormValues) {
    if (!user || !teacherId) {
      toast({
        title: 'خطا',
        description: 'اطلاعات کاربری برای ثبت گزارش یافت نشد.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      const batch = writeBatch(firestore);
      const reportId = format(data.date, 'yyyy-MM-dd');
      const reportRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports', reportId);

      // Calculate totalStudyMinutes from items
      const totalStudyMinutes = data.items.reduce((sum, item) => sum + item.studyTime, 0);

      const reportData = {
        id: reportId,
        studentId: user.uid,
        date: data.date,
        wakeUpTime: data.wakeUpTime,
        studyStartTime: data.studyStartTime,
        studyEndTime: data.studyEndTime,
        minutesOfClasses: data.minutesOfClasses,
        sleepAmount: data.sleepAmount,
        disasterLevel: data.disasterLevel,
        minutesOfMobileUsage: data.minutesOfMobileUsage,
        totalStudyMinutes: totalStudyMinutes,
        createdAt: serverTimestamp(),
      };

      batch.set(reportRef, reportData);

      // Add each subject item to a subcollection
      data.items.forEach(item => {
        const testPercentage = item.totalTestQuestions > 0 ? (item.correctTestQuestions / item.totalTestQuestions) * 100 : 0;
        const itemRef = doc(collection(reportRef, 'subjectItems'));
        batch.set(itemRef, {
          id: itemRef.id,
          dailyReportId: reportId,
          ...item,
          testPercentage: testPercentage,
        });
      });

      await batch.commit();

      toast({
        title: 'گزارش روزانه ثبت شد',
        description: 'اطلاعات امروز شما با موفقیت در سیستم ذخیره شد.',
        className: 'font-body',
      });
      form.reset();

    } catch (error) {
      console.error('Error saving daily report:', error);
      toast({
        title: 'خطا در ثبت گزارش',
        description: 'مشکلی در هنگام ذخیره اطلاعات پیش آمد.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3">
              <ClipboardEdit className="h-7 w-7 text-primary" />
              فرم گزارش کار روزانه
            </CardTitle>
            <CardDescription>عملکرد مطالعاتی و فعالیت‌های روزانه خود را در این فرم وارد کنید.</CardDescription>
          </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">اطلاعات کلی روز</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>تاریخ گزارش</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={'outline'} className={cn('pl-3 pr-3 justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>یک تاریخ انتخاب کنید</span>}
                                <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField control={form.control} name="wakeUpTime" render={({ field }) => (<FormItem><FormLabel>زمان بیداری</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="studyStartTime" render={({ field }) => (<FormItem><FormLabel>شروع مطالعه</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="studyEndTime" render={({ field }) => (<FormItem><FormLabel>پایان مطالعه</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="minutesOfClasses" render={({ field }) => (<FormItem><FormLabel>زمان کلاس (دقیقه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="sleepAmount" render={({ field }) => (<FormItem><FormLabel>خواب شب (دقیقه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="minutesOfMobileUsage" render={({ field }) => (<FormItem><FormLabel>استفاده از موبایل (دقیقه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField
                    control={form.control}
                    name="disasterLevel"
                    render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-4">
                            <FormLabel>شاخص روانی (از ۰ تا ۱۰ چقدر فاجعه‌ای؟)</FormLabel>
                            <div className="flex items-center gap-4">
                                <FormControl>
                                    <Slider dir="ltr" value={[field.value]} onValueChange={(value) => field.onChange(value[0])} max={10} step={1} className="flex-1" />
                                </FormControl>
                                <span className="font-bold text-lg text-primary w-10 text-center">{field.value}</span>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">جزئیات دروس مطالعه شده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">درس</TableHead>
                    <TableHead className="min-w-[150px]">مبحث</TableHead>
                    <TableHead>زمان مطالعه (دقیقه)</TableHead>
                    <TableHead>زمان تست (دقیقه)</TableHead>
                    <TableHead>تعداد کل تست</TableHead>
                    <TableHead>صحیح</TableHead>
                    <TableHead>غلط</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell><Input {...form.register(`items.${index}.subject`)} /></TableCell>
                      <TableCell><Input {...form.register(`items.${index}.topic`)} /></TableCell>
                      <TableCell><Input type="number" {...form.register(`items.${index}.studyTime`)} /></TableCell>
                      <TableCell><Input type="number" {...form.register(`items.${index}.testTime`)} /></TableCell>
                      <TableCell><Input type="number" {...form.register(`items.${index}.totalTestQuestions`)} /></TableCell>
                      <TableCell><Input type="number" {...form.register(`items.${index}.correctTestQuestions`)} /></TableCell>
                      <TableCell><Input type="number" {...form.register(`items.${index}.incorrectTestQuestions`)} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ subject: '', topic: '', studyTime: 0, totalTestQuestions: 0, correctTestQuestions: 0, incorrectTestQuestions: 0, testTime: 0 })}>
              <PlusCircle className="ml-2 h-4 w-4" /> افزودن درس
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            ثبت گزارش
          </Button>
        </div>
      </form>
    </Form>
  );
}
