'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { CalendarIcon, FileUp, PlusCircle, Trash2, Save, Loader2, Lock } from 'lucide-react';
import { format } from 'date-fns-jalali';
import React from 'react';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const reportItemSchema = z.object({
  subject: z.string().min(1, 'درس الزامی است.'),
  topic: z.string().optional().default(''),
  studyTime: z.coerce.number().min(0, 'زمان مطالعه نمی‌تواند منفی باشد.').default(0),
  testCount: z.coerce.number().int().min(0, 'تعداد تست نمی‌تواند منفی باشد.').default(0),
  correctCount: z.coerce.number().int().min(0, 'تعداد صحیح نمی‌تواند منفی باشد.').default(0),
  wrongCount: z.coerce.number().int().min(0, 'تعداد غلط نمی‌تواند منفی باشد.').default(0),
  testTime: z.coerce.number().min(0, 'زمان تست نمی‌تواند منفی باشد.').default(0),
});

const formSchema = z.object({
  date: z.date({ required_error: 'تاریخ الزامی است.' }),
  wakeUpTime: z.string().optional().default(''),
  studyStartTime: z.string().optional().default(''),
  items: z.array(reportItemSchema),
  sleepHours: z.number().min(0).max(24).default(8),
  moodScore: z.number().min(1).max(10).default(7),
  mobileHours: z.number().min(0).max(24).default(2),
});

type FormValues = z.infer<typeof formSchema>;

interface DailyReportFormProps {
    isBlocked?: boolean;
}

export function DailyReportForm({ isBlocked = false }: DailyReportFormProps) {
  const { toast } = useToast();
  const { user, firestore, role } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const teacherId = role?.split(':')[1];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      items: [
        { subject: '', topic: '', studyTime: 0, testCount: 0, correctCount: 0, wrongCount: 0, testTime: 0 },
      ],
      sleepHours: 8,
      moodScore: 7,
      mobileHours: 2,
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
        description: 'اطلاعات کاربری یا معلم برای ثبت گزارش یافت نشد.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    const reportId = format(data.date, 'yyyy-MM-dd');
    const reportRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports', reportId);
    
    const totalStudyMinutes = data.items.reduce((sum, item) => sum + item.studyTime, 0);

    const reportData = {
        id: reportId,
        studentId: user.uid,
        date: data.date,
        wakeUpTime: data.wakeUpTime,
        studyStartTime: data.studyStartTime,
        studyEndTime: '', // This should be captured or derived if needed
        totalStudyMinutes: totalStudyMinutes,
        minutesOfClasses: 0, // This should be captured if needed
        sleepAmount: data.sleepHours,
        disasterLevel: data.moodScore,
        minutesOfMobileUsage: data.mobileHours * 60,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const subjectItems = data.items.map((item) => {
        const testCount = item.testCount || 0;
        const correctCount = item.correctCount || 0;
        const wrongCount = item.wrongCount || 0;
        
        const testPercentage = testCount > 0 ? (correctCount / testCount) * 100 : 0;
        
        return {
            ...item,
            dailyReportId: reportId,
            incorrectTestQuestions: wrongCount,
            testPercentage: parseFloat(testPercentage.toFixed(2)),
            totalTestQuestions: testCount,
            correctTestQuestions: correctCount,
        }
    });

    try {
        const batch = writeBatch(firestore);
        
        batch.set(reportRef, reportData, { merge: true });

        const subjectItemsCollection = collection(reportRef, 'subjectItems');
        // This is a simplified approach. For a robust solution, you'd query existing items and decide to update/delete/add.
        // For now, we will add them all as new, which can lead to duplicates if the form is submitted multiple times for the same day.
        // A better approach would be to manage this within a transaction or a cloud function.
        for (const item of subjectItems) {
            if (item.subject) {
                const subjectItemRef = doc(subjectItemsCollection);
                batch.set(subjectItemRef, {...item, id: subjectItemRef.id });
            }
        }

        await batch.commit();

        toast({
            title: "گزارش ثبت شد",
            description: "گزارش روزانه شما با موفقیت در سیستم ذخیره شد.",
            className: 'font-body',
        });
        form.reset();

    } catch (error) {
        console.error("Error saving report: ", error);
        toast({
            title: "خطا در ثبت گزارش",
            description: "مشکلی در هنگام ذخیره اطلاعات پیش آمد.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-xl">ثبت گزارش کار روزانه</CardTitle>
            <CardDescription>
              فعالیت‌های امروز خود را با دقت وارد کنید.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isBlocked && (
                <Alert variant="destructive" className="bg-yellow-50 border-yellow-300 text-yellow-800">
                    <Lock className="h-4 w-4 !text-yellow-800" />
                    <AlertTitle className="font-bold">ثبت گزارش کار موقتاً قفل شده است</AlertTitle>
                    <AlertDescription>
                        مشاور شما یک توصیه جدید برایتان ارسال کرده است. لطفاً ابتدا آن را مطالعه و تأیید کنید تا بتوانید گزارش جدید ثبت نمایید.
                    </AlertDescription>
                </Alert>
            )}
            <fieldset disabled={isBlocked || isLoading} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>تاریخ</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                className={cn(
                                'w-full justify-start text-right font-normal',
                                !field.value && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="ml-2 h-4 w-4" />
                                {field.value ? (
                                format(field.value, 'PPP')
                                ) : (
                                <span>یک تاریخ انتخاب کنید</span>
                                )}
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="wakeUpTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>ساعت بیداری</FormLabel>
                        <FormControl>
                        <Input type="time" {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="studyStartTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>شروع مطالعه</FormLabel>
                        <FormControl>
                        <Input type="time" {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />
                </div>

                <div>
                <h3 className="mb-2 font-headline text-lg">آیتم‌های درسی</h3>
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>درس</TableHead>
                        <TableHead>مبحث</TableHead>
                        <TableHead>زمان مطالعه (دقیقه)</TableHead>
                        <TableHead>کل تست</TableHead>
                        <TableHead>درست</TableHead>
                        <TableHead>غلط</TableHead>
                        <TableHead>زمان تست (دقیقه)</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                        <TableRow key={field.id}>
                            <TableCell><Input {...form.register(`items.${index}.subject`)} /></TableCell>
                            <TableCell><Input {...form.register(`items.${index}.topic`)} /></TableCell>
                            <TableCell><Input type="number" {...form.register(`items.${index}.studyTime`)} /></TableCell>
                            <TableCell><Input type="number" {...form.register(`items.${index}.testCount`)} /></TableCell>
                            <TableCell><Input type="number" {...form.register(`items.${index}.correctCount`)} /></TableCell>
                            <TableCell><Input type="number" {...form.register(`items.${index}.wrongCount`)} /></TableCell>
                            <TableCell><Input type="number" {...form.register(`items.${index}.testTime`)} /></TableCell>
                            <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ subject: '', topic: '', studyTime: 0, testCount: 0, correctCount: 0, wrongCount: 0, testTime: 0 })}
                >
                    <PlusCircle className="ml-2 h-4 w-4" />
                    افزودن آیتم جدید
                </Button>
                </div>
                
                <div className="space-y-6 pt-4">
                    <FormField control={form.control} name="sleepHours" render={({ field }) => (
                        <FormItem>
                            <FormLabel>میزان خواب: {field.value} ساعت</FormLabel>
                            <FormControl>
                                <Slider dir="ltr" value={[field.value]} onValueChange={(value) => field.onChange(value[0])} max={12} step={0.5} />
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="moodScore" render={({ field }) => (
                        <FormItem>
                            <FormLabel>ارزیابی روانی (فاجعه!): {field.value} از ۱۰</FormLabel>
                            <FormControl>
                                <Slider dir="ltr" value={[field.value]} onValueChange={(value) => field.onChange(value[0])} max={10} step={1} />
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="mobileHours" render={({ field }) => (
                        <FormItem>
                            <FormLabel>میزان موبایل: {field.value} ساعت</FormLabel>
                            <FormControl>
                                <Slider dir="ltr" value={[field.value]} onValueChange={(value) => field.onChange(value[0])} max={10} step={0.5} />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>

                <div>
                <FormLabel>فایل ضمیمه (اختیاری)</FormLabel>
                <div className="mt-2 flex items-center gap-4">
                    <Input id="file-upload" type="file" className="hidden" />
                    <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <FileUp className="ml-2 h-4 w-4" />
                            انتخاب فایل
                        </label>
                    </Button>
                    <span className="text-sm text-muted-foreground">هنوز فایلی انتخاب نشده.</span>
                </div>
                </div>
            </fieldset>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={isLoading || !teacherId || isBlocked}>
              {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : isBlocked ? <Lock className="ml-2 h-4 w-4" /> : <Save className="ml-2 h-4 w-4" />}
              {isBlocked ? 'گزارش قفل شده' : 'ثبت گزارش'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
