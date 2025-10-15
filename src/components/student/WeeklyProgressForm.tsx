'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { BookCopy, PlusCircle, Save, Trash2 } from 'lucide-react';

const studyTimeDetailSchema = z.object({
    subject: z.string().min(1, "نام درس الزامی است."),
    targetTime: z.coerce.number().min(0),
    actualTime: z.coerce.number().min(0),
});

const testDetailSchema = z.object({
    subject: z.string().min(1, "نام درس الزامی است."),
    targetCount: z.coerce.number().min(0),
    actualCount: z.coerce.number().min(0),
});

const formSchema = z.object({
    weekNumber: z.coerce.number().min(1),
    weekDateRange: z.string().min(1, "بازه زمانی هفته الزامی است."),
    studyTimeDetails: z.array(studyTimeDetailSchema),
    testDetails: z.array(testDetailSchema),
    lastWeekTotalStudy: z.coerce.number().min(0),
    thisWeekTotalStudy: z.coerce.number().min(0),
    lastWeekTotalTests: z.coerce.number().min(0),
    thisWeekTotalTests: z.coerce.number().min(0),
    keyAchievements: z.string().optional(),
    whatWentWell: z.string().optional(),
    whatCouldBeBetter: z.string().optional(),
    nextWeekGoals: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function WeeklyProgressForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            weekNumber: 1,
            weekDateRange: '',
            studyTimeDetails: [{ subject: 'ریاضی', targetTime: 600, actualTime: 550 }],
            testDetails: [{ subject: 'فیزیک', targetCount: 150, actualCount: 120 }],
            lastWeekTotalStudy: 0,
            thisWeekTotalStudy: 0,
            lastWeekTotalTests: 0,
            thisWeekTotalTests: 0,
            keyAchievements: '',
            whatWentWell: '',
            whatCouldBeBetter: '',
            nextWeekGoals: '',
        },
    });

    const { fields: studyFields, append: appendStudy, remove: removeStudy } = useFieldArray({
        control: form.control,
        name: "studyTimeDetails"
    });

    const { fields: testFields, append: appendTest, remove: removeTest } = useFieldArray({
        control: form.control,
        name: "testDetails"
    });

    function onSubmit(data: FormValues) {
        console.log(data);
        // Logic to save data will be added later
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3">
                            <BookCopy className="h-7 w-7 text-primary" />
                            فرم پیگیری هفتگی پیشرفت تحصیلی
                        </CardTitle>
                        <CardDescription>
                            این فرم به شما کمک می‌کند تا جریان مطالعه، تست و جهت پیشرفت خود را در هر هفته ارزیابی کنید.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Section 1: General Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">۱. اطلاعات کلی هفته</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="weekNumber" render={({ field }) => (
                            <FormItem>
                                <FormLabel>شماره هفته</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="weekDateRange" render={({ field }) => (
                             <FormItem>
                                <FormLabel>محدوده زمانی هفته</FormLabel>
                                <FormControl><Input placeholder="مثال: ۲۴ تا ۳۰ مهر" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
                
                {/* Section 2 & 3: Study and Test Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">۲. جزئیات زمان مطالعه (به دقیقه)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>درس</TableHead>
                                        <TableHead>زمان هدف</TableHead>
                                        <TableHead>زمان صرف‌شده</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studyFields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell><Input {...form.register(`studyTimeDetails.${index}.subject`)} /></TableCell>
                                            <TableCell><Input type="number" {...form.register(`studyTimeDetails.${index}.targetTime`)} /></TableCell>
                                            <TableCell><Input type="number" {...form.register(`studyTimeDetails.${index}.actualTime`)} /></TableCell>
                                            <TableCell><Button variant="ghost" size="icon" onClick={() => removeStudy(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendStudy({ subject: '', targetTime: 0, actualTime: 0 })}>
                                <PlusCircle className="ml-2 h-4 w-4" /> افزودن درس
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">۳. جزئیات تعداد تست‌ها</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>درس</TableHead>
                                        <TableHead>تعداد هدف</TableHead>
                                        <TableHead>تعداد زده‌شده</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {testFields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell><Input {...form.register(`testDetails.${index}.subject`)} /></TableCell>
                                            <TableCell><Input type="number" {...form.register(`testDetails.${index}.targetCount`)} /></TableCell>
                                            <TableCell><Input type="number" {...form.register(`testDetails.${index}.actualCount`)} /></TableCell>
                                            <TableCell><Button variant="ghost" size="icon" onClick={() => removeTest(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendTest({ subject: '', targetCount: 0, actualCount: 0 })}>
                                <PlusCircle className="ml-2 h-4 w-4" /> افزودن درس
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 4: Progress Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">۴. مقایسه پیشرفت هفتگی</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead>هفته گذشته</TableHead>
                                    <TableHead>این هفته</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">کل زمان مطالعه (دقیقه)</TableCell>
                                    <TableCell><Input type="number" {...form.register('lastWeekTotalStudy')} /></TableCell>
                                    <TableCell><Input type="number" {...form.register('thisWeekTotalStudy')} /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">کل تست‌های زده شده</TableCell>
                                    <TableCell><Input type="number" {...form.register('lastWeekTotalTests')} /></TableCell>
                                    <TableCell><Input type="number" {...form.register('thisWeekTotalTests')} /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium align-top">دستاوردهای کلیدی</TableCell>
                                    <TableCell colSpan={2}><Textarea {...form.register('keyAchievements')} placeholder="مهم‌ترین موفقیت‌های این هفته را بنویسید..." /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 {/* Section 5: Reflection & Goals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">۵. بازتاب و هدف‌گذاری</CardTitle>
                        <CardDescription>برای لحظاتی خلوت کنید و به این سوالات پاسخ دهید. این بخش مهم‌ترین قسمت گزارش شماست.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="whatWentWell" render={({ field }) => (
                            <FormItem>
                                <FormLabel>چه چیزهایی این هفته خوب پیش رفت؟</FormLabel>
                                <FormControl><Textarea placeholder="نقاط قوت، موفقیت‌ها و احساسات مثبت خود را اینجا بنویسید..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="whatCouldBeBetter" render={({ field }) => (
                            <FormItem>
                                <FormLabel>چه چیزهایی می‌توانست بهتر باشد؟</FormLabel>
                                <FormControl><Textarea placeholder="چالش‌ها، موانع و نقاطی که نیاز به بهبود دارند را مشخص کنید..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="nextWeekGoals" render={({ field }) => (
                            <FormItem>
                                <FormLabel>سه هدف دقیق و قابل‌اندازه‌گیری برای هفته آینده؟</FormLabel>
                                <FormControl><Textarea placeholder="۱. افزایش ساعت مطالعه فیزیک به روزی ۲ ساعت.&#x0a;۲. زدن ۳۰ تست قرابت معنایی هر شب.&#x0a;۳. شروع مطالعه فصل جدید شیمی." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg">
                        <Save className="ml-2 h-4 w-4" />
                        ذخیره گزارش هفتگی
                    </Button>
                </div>
            </form>
        </Form>
    );
}
