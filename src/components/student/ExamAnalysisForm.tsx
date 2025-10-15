'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardPen, PlusCircle, Save, Trash2, CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns-jalali';
import { useFirebase } from '@/firebase';
import React from 'react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const beforeExamSchema = z.object({
  previous_score: z.coerce.number().optional(),
  goal_first: z.coerce.number().optional(),
});

const executionSchema = z.object({
  correct: z.coerce.number().min(0),
  wrong: z.coerce.number().min(0),
  blank: z.coerce.number().min(0),
  time_spent: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const afterExamSchema = z.object({
  score: z.coerce.number().optional(),
});

const examAnalysisSubjectSchema = z.object({
  subject: z.string().min(1, "نام درس الزامی است."),
  before_exam: beforeExamSchema,
  execution: executionSchema,
  after_exam: afterExamSchema,
});

const effortCompareSchema = z.object({
  subject: z.string().min(1, "نام درس الزامی است."),
  study_hours: z.coerce.number().optional(),
  test_hours: z.coerce.number().optional(),
  exam_score: z.coerce.number().optional(),
  teacher_opinion: z.string().optional(),
  reason: z.string().optional(),
});


const formSchema = z.object({
    exam_date: z.date({ required_error: 'تاریخ الزامی است.' }),
    total_score: z.coerce.number().optional(),
    rank_country: z.coerce.number().optional(),
    subjects_summary_correct: z.coerce.number().optional(),
    subjects_summary_wrong: z.coerce.number().optional(),
    subjects_summary_blank: z.coerce.number().optional(),
    exam_analysis: z.array(examAnalysisSubjectSchema),
    effort_compare: z.array(effortCompareSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function ExamAnalysisForm() {
    const { toast } = useToast();
    const { firestore, user, role } = useFirebase();
    const [isLoading, setIsLoading] = React.useState(false);
    const teacherId = role?.split(':')[1];

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            exam_date: new Date(),
            exam_analysis: [{ 
                subject: '', 
                before_exam: { previous_score: 0, goal_first: 0 },
                execution: { correct: 0, wrong: 0, blank: 0, time_spent: 0, notes: '' },
                after_exam: { score: 0 }
            }],
            effort_compare: [{
                subject: '',
                study_hours: 0,
                test_hours: 0,
                exam_score: 0,
                teacher_opinion: '',
                reason: ''
            }],
        },
    });

    const { fields: analysisFields, append: appendAnalysis, remove: removeAnalysis } = useFieldArray({
        control: form.control,
        name: "exam_analysis"
    });

    const { fields: effortFields, append: appendEffort, remove: removeEffort } = useFieldArray({
        control: form.control,
        name: "effort_compare"
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

        const reportId = format(data.exam_date, 'yyyy-MM-dd');
        const reportRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'examReports', reportId);

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
                title: "فرم تحلیل آزمون ذخیره شد",
                description: "اطلاعات آزمون شما با موفقیت در سیستم ثبت گردید.",
                className: 'font-body',
            });
            form.reset();
        } catch (error) {
             console.error("Error saving exam report: ", error);
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="bg-muted/30 border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3">
                            <ClipboardPen className="h-7 w-7 text-primary" />
                            فرم تحلیل آزمون عددمحور
                        </CardTitle>
                        <CardDescription>
                            این فرم به شما در تحلیل دقیق عملکرد کمی و کیفی در آزمون‌ها کمک می‌کند.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="analysis" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="analysis">تحلیل آزمون</TabsTrigger>
                        <TabsTrigger value="effort">مقایسه تلاش و عملکرد</TabsTrigger>
                    </TabsList>
                    
                    {/* Tab 1: Exam Analysis */}
                    <TabsContent value="analysis" className="space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline text-lg">۱. اطلاعات کلی آزمون</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="exam_date" render={({ field }) => (
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
                                <FormField control={form.control} name="total_score" render={({ field }) => (
                                    <FormItem><FormLabel>تراز کل</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="rank_country" render={({ field }) => (
                                    <FormItem><FormLabel>رتبه در کشور</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="subjects_summary_correct" render={({ field }) => (
                                    <FormItem><FormLabel>مجموع صحیح‌ها</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="subjects_summary_wrong" render={({ field }) => (
                                    <FormItem><FormLabel>مجموع غلط‌ها</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="subjects_summary_blank" render={({ field }) => (
                                    <FormItem><FormLabel>مجموع نزده‌ها</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">۲. تحلیل درس به درس</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">درس</TableHead>
                                            <TableHead>درصد قبلی</TableHead>
                                            <TableHead>هدف</TableHead>
                                            <TableHead>صحیح</TableHead>
                                            <TableHead>غلط</TableHead>
                                            <TableHead>نزده</TableHead>
                                            <TableHead>درصد فعلی</TableHead>
                                            <TableHead className="min-w-[200px]">یادداشت</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analysisFields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell><Input {...form.register(`exam_analysis.${index}.subject`)} /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`exam_analysis.${index}.before_exam.previous_score`)} /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`exam_analysis.${index}.before_exam.goal_first`)} /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`exam_analysis.${index}.execution.correct`)} /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`exam_analysis.${index}.execution.wrong`)} /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`exam_analysis.${index}.execution.blank`)} /></TableCell>
                                                <TableCell><Input type="number" {...form.register(`exam_analysis.${index}.after_exam.score`)} /></TableCell>
                                                <TableCell><Input {...form.register(`exam_analysis.${index}.execution.notes`)} /></TableCell>
                                                <TableCell><Button variant="ghost" size="icon" type="button" onClick={() => removeAnalysis(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendAnalysis({ subject: '', before_exam: {}, execution: { correct: 0, wrong: 0, blank: 0 }, after_exam: {} })}>
                                    <PlusCircle className="ml-2 h-4 w-4" /> افزودن درس
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Tab 2: Effort Comparison */}
                    <TabsContent value="effort">
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline text-lg">مقایسه درصدها با میزان تلاش</CardTitle>
                                <CardDescription>این بخش به شما کمک می‌کند تا همبستگی بین میزان مطالعه و نتیجه در آزمون را پیدا کنید.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[150px]">درس</TableHead>
                                                <TableHead>ساعت مطالعه</TableHead>
                                                <TableHead>ساعت تست</TableHead>
                                                <TableHead>درصد آزمون</TableHead>
                                                <TableHead>نظر مشاور</TableHead>
                                                <TableHead>دلیل نتیجه</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {effortFields.map((field, index) => (
                                                <TableRow key={field.id}>
                                                    <TableCell><Input {...form.register(`effort_compare.${index}.subject`)} /></TableCell>
                                                    <TableCell><Input type="number" step="0.5" {...form.register(`effort_compare.${index}.study_hours`)} /></TableCell>
                                                    <TableCell><Input type="number" step="0.5" {...form.register(`effort_compare.${index}.test_hours`)} /></TableCell>
                                                    <TableCell><Input type="number" {...form.register(`effort_compare.${index}.exam_score`)} /></TableCell>
                                                    <TableCell><Input {...form.register(`effort_compare.${index}.teacher_opinion`)} /></TableCell>
                                                    <TableCell><Input {...form.register(`effort_compare.${index}.reason`)} /></TableCell>
                                                    <TableCell><Button variant="ghost" size="icon" type="button" onClick={() => removeEffort(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendEffort({ subject: '', study_hours: 0, test_hours: 0, exam_score: 0, teacher_opinion: '', reason: '' })}>
                                    <PlusCircle className="ml-2 h-4 w-4" /> افزودن درس
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                     <Button type="submit" size="lg" disabled={isLoading}>
                        {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                        ذخیره تحلیل آزمون
                    </Button>
                </div>
            </form>
        </Form>
    );
}
