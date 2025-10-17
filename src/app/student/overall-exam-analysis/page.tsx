
'use client';

import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection, useFirebase, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import type { OverallExamReport } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClipboardCheck, PlusCircle, Save, Trash2, Loader2, Smile, Meh, Frown, CalendarIcon, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns-jalali';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const examEntrySchema = z.object({
  examNumber: z.coerce.number().min(1, 'شماره آزمون الزامی است.'),
  date: z.date({ required_error: 'تاریخ الزامی است.' }),
  correctCount: z.coerce.number().min(0),
  incorrectCount: z.coerce.number().min(0),
  percentage: z.coerce.number().min(0).max(100),
  questionsAnswered: z.coerce.number().min(0),
  satisfaction: z.coerce.number().min(1).max(3),
  notes: z.string().optional(),
});

const formSchema = z.object({
  subjectName: z.string().min(1, 'نام درس الزامی است.'),
  newEntry: examEntrySchema,
});

type FormValues = z.infer<typeof formSchema>;

export default function OverallExamAnalysisPage() {
  const { firestore, user, role } = useFirebase();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [deletingEntry, setDeletingEntry] = useState<{ report: OverallExamReport, entryIndex: number } | null>(null);

  const teacherId = role?.split(':')[1];

  const reportsQuery = useMemoFirebase(() => {
    if (!user || !teacherId) return null;
    return query(collection(firestore, 'teachers', teacherId, 'students', user.uid, 'overallExamReports'));
  }, [firestore, user, teacherId]);

  const { data: reports, isLoading: areReportsLoading } = useCollection<OverallExamReport>(reportsQuery);

  const subjects = useMemo(() => {
    if (!reports) return [];
    return [...new Set(reports.map(r => r.subjectName))];
  }, [reports]);

  const currentReport = useMemo(() => {
    if (!selectedSubject || !reports) return null;
    return reports.find(r => r.subjectName === selectedSubject) || null;
  }, [selectedSubject, reports]);

  const form = useForm<FormValues['newEntry']>({
    resolver: zodResolver(examEntrySchema),
    defaultValues: {
      examNumber: (currentReport?.examEntries.length || 0) + 1,
      date: new Date(),
      correctCount: 0,
      incorrectCount: 0,
      percentage: 0,
      questionsAnswered: 0,
      satisfaction: 2,
      notes: '',
    },
  });

  React.useEffect(() => {
      form.reset({
        examNumber: (currentReport?.examEntries.length || 0) + 1,
        date: new Date(),
        correctCount: 0,
        incorrectCount: 0,
        percentage: 0,
        questionsAnswered: 0,
        satisfaction: 2,
        notes: '',
      });
  }, [currentReport, form]);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
  };
  
  const handleNewSubject = () => {
    const newSubject = prompt('نام درس جدید را وارد کنید:');
    if (newSubject && !subjects.includes(newSubject)) {
      setSelectedSubject(newSubject);
    }
  };


  async function onSubmit(data: FormValues['newEntry']) {
    if (!user || !teacherId || !selectedSubject) {
      toast({ title: 'خطا', description: 'لطفا ابتدا یک درس را انتخاب یا ایجاد کنید.', variant: 'destructive' });
      return;
    }

    const reportId = selectedSubject.replace(/\s+/g, '-');
    const reportRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'overallExamReports', reportId);

    const newEntries = currentReport ? [...currentReport.examEntries, data] : [data];
    newEntries.sort((a, b) => a.examNumber - b.examNumber);

    const reportData: OverallExamReport = {
      id: reportId,
      studentId: user.uid,
      subjectName: selectedSubject,
      examEntries: newEntries,
      createdAt: currentReport?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(reportRef, reportData, { merge: true });
    toast({ title: 'موفقیت', description: `آزمون جدید برای درس ${selectedSubject} ثبت شد.` });
    form.reset();
  }
  
  const handleDelete = () => {
    if (!deletingEntry || !user || !teacherId) return;

    const { report, entryIndex } = deletingEntry;
    const reportRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'overallExamReports', report.id);
    
    const updatedEntries = report.examEntries.filter((_, index) => index !== entryIndex);
    
    if (updatedEntries.length === 0) {
        // Delete the whole document if no entries are left
        deleteDocumentNonBlocking(reportRef);
        toast({ title: 'درس حذف شد', description: `درس ${report.subjectName} به دلیل نداشتن آزمون حذف شد.`, variant: 'destructive' });
        setSelectedSubject('');
    } else {
        const updatedReport = { ...report, examEntries: updatedEntries, updatedAt: serverTimestamp() };
        setDocumentNonBlocking(reportRef, updatedReport, { merge: true });
        toast({ title: 'آزمون حذف شد', description: 'آزمون مورد نظر با موفقیت حذف شد.', variant: 'destructive' });
    }
    setDeletingEntry(null);
  };

  const satisfactionEmojis = { 1: '☹️', 2: '😐', 3: '🙂' };

  if (areReportsLoading) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <ClipboardCheck className="h-7 w-7 text-primary" />
            تحلیل آزمون کلی
          </CardTitle>
          <CardDescription>روند پیشرفت خود را در هر درس در طول زمان تحلیل کنید.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
                <Select onValueChange={handleSubjectChange} value={selectedSubject}>
                    <SelectTrigger>
                        <SelectValue placeholder="یک درس را انتخاب کنید..." />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleNewSubject} variant="outline"><PlusCircle className="ml-2 h-4 w-4" /> درس جدید</Button>
        </CardContent>
      </Card>

      {selectedSubject && (
          <>
            <Card>
                <CardHeader>
                    <CardTitle className='font-headline text-lg'>ثبت آزمون جدید برای درس: {selectedSubject}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                <FormField control={form.control} name="examNumber" render={({ field }) => (
                                    <FormItem><FormLabel>شماره آزمون</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>تاریخ</FormLabel>
                                    <Popover><PopoverTrigger asChild><FormControl>
                                        <Button variant="outline" className={cn('justify-start text-right font-normal',!field.value && 'text-muted-foreground')}>
                                        <CalendarIcon className="ml-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>تاریخ</span>}
                                        </Button>
                                    </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="correctCount" render={({ field }) => (
                                    <FormItem><FormLabel>تعداد درست</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="incorrectCount" render={({ field }) => (
                                    <FormItem><FormLabel>تعداد غلط</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="percentage" render={({ field }) => (
                                    <FormItem><FormLabel>درصد</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="questionsAnswered" render={({ field }) => (
                                    <FormItem><FormLabel>تعداد زده</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="notes" render={({ field }) => (
                                    <FormItem><FormLabel>توضیحات</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="satisfaction" render={({ field }) => (
                                    <FormItem><FormLabel>میزان رضایت</FormLabel>
                                    <div className="flex gap-2 pt-2">
                                        {[1, 2, 3].map(val => (
                                            <Button key={val} type="button" variant={field.value === val ? 'default' : 'outline'} size="icon" onClick={() => field.onChange(val)}>
                                                {satisfactionEmojis[val as keyof typeof satisfactionEmojis]}
                                            </Button>
                                        ))}
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className='ml-2 h-4 w-4 animate-spin' /> : <Save className='ml-2 h-4 w-4'/>}
                                ثبت آزمون
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">سوابق آزمون‌های درس: {selectedSubject}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>#</TableHead><TableHead>تاریخ</TableHead><TableHead>درست</TableHead><TableHead>غلط</TableHead>
                            <TableHead>درصد</TableHead><TableHead>زده</TableHead><TableHead>رضایت</TableHead><TableHead>توضیحات</TableHead><TableHead></TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {currentReport?.examEntries.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{entry.examNumber}</TableCell>
                                    <TableCell>{format(new Date(entry.date), 'yyyy/MM/dd')}</TableCell>
                                    <TableCell>{entry.correctCount}</TableCell>
                                    <TableCell>{entry.incorrectCount}</TableCell>
                                    <TableCell className="font-bold text-primary">{entry.percentage}%</TableCell>
                                    <TableCell>{entry.questionsAnswered}</TableCell>
                                    <TableCell className="text-2xl">{satisfactionEmojis[entry.satisfaction as keyof typeof satisfactionEmojis]}</TableCell>
                                    <TableCell>{entry.notes}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => setDeletingEntry({ report: currentReport, entryIndex: index })}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">نمودار پیشرفت درس: {selectedSubject}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={currentReport?.examEntries || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="examNumber" label={{ value: 'شماره آزمون', position: 'insideBottom', offset: -5 }} />
                            <YAxis domain={[0, 100]} label={{ value: 'درصد', angle: -90, position: 'insideLeft' }} />
                            <Tooltip contentStyle={{ fontFamily: 'Vazirmatn' }} />
                            <Legend wrapperStyle={{fontFamily: 'Vazirmatn'}} />
                            <Line type="monotone" dataKey="percentage" name="درصد" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            
            <AlertDialog open={!!deletingEntry} onOpenChange={(open) => !open && setDeletingEntry(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-destructive" />تایید حذف</AlertDialogTitle>
                        <AlertDialogDescription>آیا از حذف این آزمون مطمئن هستید؟ این عمل قابل بازگشت نیست.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </>
      )}

    </div>
  );
}

