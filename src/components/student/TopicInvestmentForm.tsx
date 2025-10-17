
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, PlusCircle, Save, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { useFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const topicSchema = z.object({
  topic: z.string().min(1, "مبحث الزامی است."),
  priority: z.coerce.number().min(1, "اولویت الزامی است."),
  studyHours: z.coerce.number().min(0).default(0),
  videoHours: z.coerce.number().min(0).default(0),
  testHours: z.coerce.number().min(0).default(0),
  extraActions: z.string().optional().default(''),
});

const formSchema = z.object({
  lessonName: z.string().min(1, "نام درس الزامی است."),
  averageScore: z.coerce.number().optional(),
  mostColor: z.string().optional(),
  holidayGoal: z.string().optional(),
  examGoal: z.string().optional(),
  lessonTimeInvestment: z.coerce.number().optional(),
  partCount: z.coerce.number().optional(),
  partTime: z.coerce.number().optional(),
  finalNotes: z.string().optional(),
  topics: z.array(topicSchema).min(1, 'حداقل یک مبحث باید اضافه شود.'),
});

type FormValues = z.infer<typeof formSchema>;

export function TopicInvestmentForm() {
    const { toast } = useToast();
    const { firestore, user, role } = useFirebase();
    const [isLoading, setIsLoading] = React.useState(false);
    const teacherId = role?.split(':')[1];
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            lessonName: '',
            averageScore: 0,
            mostColor: '',
            holidayGoal: '',
            examGoal: '',
            lessonTimeInvestment: 0,
            partCount: 0,
            partTime: 0,
            finalNotes: '',
            topics: [{ topic: '', priority: 1, studyHours: 0, videoHours: 0, testHours: 0, extraActions: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "topics"
    });

    async function onSubmit(data: FormValues) {
        if (!user || !teacherId) {
            toast({
                title: "خطا",
                description: "اطلاعات کاربری برای ثبت گزارش یافت نشد.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);

        const reportId = `${data.lessonName.replace(/\s/g, '-')}-${new Date().getTime()}`;
        const reportRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'topicInvestments', reportId);

        const reportData = {
            id: reportId,
            studentId: user.uid,
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        try {
            setDocumentNonBlocking(reportRef, reportData, { merge: true });
            toast({
                title: "فرم روندنما ذخیره شد",
                description: "اطلاعات برنامه‌ریزی شما با موفقیت ثبت شد.",
                className: 'font-body',
            });
            form.reset();
        } catch (error) {
            console.error("Error saving topic investment report: ", error);
            toast({
                title: "خطا در ثبت گزارش",
                description: "مشکلی در هنگام ذخیره اطلاعات پیش آمد.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const totalInvestment = form.watch('topics').reduce((acc, topic) => {
        return acc + (topic.studyHours || 0) + (topic.videoHours || 0) + (topic.testHours || 0);
    }, 0);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="bg-muted/30 border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3">
                            <BarChart3 className="h-7 w-7 text-primary" />
                            فرم روندنمای درسی
                        </CardTitle>
                        <CardDescription>
                            مسیر یادگیری هر درس را گام‌به‌گام و با کنترل پیشرفت برنامه‌ریزی کنید.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Section 1: General Info */}
                <Card>
                     <CardHeader>
                        <CardTitle className="font-headline text-lg">اطلاعات کلی درس</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="lessonName" render={({ field }) => (
                            <FormItem><FormLabel>نام درس</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="averageScore" render={({ field }) => (
                            <FormItem><FormLabel>میانگین درصد</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="holidayGoal" render={({ field }) => (
                            <FormItem><FormLabel>هدفگذاری عید</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="mostColor" render={({ field }) => (
                            <FormItem><FormLabel>بیشترین رنگ شما</FormLabel><FormControl><Input placeholder="مثال: زرد" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="lessonTimeInvestment" render={({ field }) => (
                            <FormItem><FormLabel>سرمایه درس (دقیقه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="examGoal" render={({ field }) => (
                            <FormItem><FormLabel>هدفگذاری کنکور</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="partCount" render={({ field }) => (
                            <FormItem><FormLabel>تعداد پارت‌ها</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="partTime" render={({ field }) => (
                            <FormItem><FormLabel>زمان هر پارت (دقیقه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                
                {/* Section 2: Topics Table */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">جزئیات برنامه‌ریزی بر اساس مبحث</CardTitle>
                        <CardDescription>مجموع سرمایه‌گذاری زمانی شما: <span className='font-bold text-primary'>{totalInvestment.toFixed(2)}</span> ساعت</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">مبحث</TableHead>
                                        <TableHead>اولویت</TableHead>
                                        <TableHead>مطالعه (ساعت)</TableHead>
                                        <TableHead>ویدئو (ساعت)</TableHead>
                                        <TableHead>تست (ساعت)</TableHead>
                                        <TableHead className="min-w-[150px]">سایر اقدامات</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell><Input {...form.register(`topics.${index}.topic`)} /></TableCell>
                                            <TableCell><Input type="number" {...form.register(`topics.${index}.priority`)} /></TableCell>
                                            <TableCell><Input type="number" step="0.5" {...form.register(`topics.${index}.studyHours`)} /></TableCell>
                                            <TableCell><Input type="number" step="0.5" {...form.register(`topics.${index}.videoHours`)} /></TableCell>
                                            <TableCell><Input type="number" step="0.5" {...form.register(`topics.${index}.testHours`)} /></TableCell>
                                            <TableCell><Input {...form.register(`topics.${index}.extraActions`)} /></TableCell>
                                            <TableCell><Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ topic: '', priority: fields.length + 1, studyHours: 0, videoHours: 0, testHours: 0, extraActions: '' })}>
                            <PlusCircle className="ml-2 h-4 w-4" /> افزودن مبحث
                        </Button>
                    </CardContent>
                </Card>

                 {/* Section 3: Final Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">یادداشت شخصی</CardTitle>
                         <CardDescription>آینده در مورد این مدت، نکته‌ای داری؟ اینجا بنویس تا فراموش نکنی.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField control={form.control} name="finalNotes" render={({ field }) => (
                            <FormItem>
                                <FormControl><Textarea placeholder="هر نکته، یادداشت یا تحلیل اضافی که لازم می‌دانید اینجا بنویسید..." {...field} rows={4} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isLoading}>
                        {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                        ذخیره روندنما
                    </Button>
                </div>
            </form>
        </Form>
    );
}

    