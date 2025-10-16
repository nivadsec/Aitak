'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StudentPerformanceAnalysis from '@/components/teacher/StudentPerformanceAnalysis';
import { useDoc, useFirebase, useMemoFirebase, useCollection, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, query, orderBy, getDocs, limit, where } from 'firebase/firestore';
import { getDailyReportsForGenkit } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Lightbulb, FileDown, Loader2 } from 'lucide-react';
import { downloadJson } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RecommendationForm } from '@/components/teacher/RecommendationForm';
import type { Student, StudentRecommendation, FocusInterval, StudentReport } from '@/lib/types';
import { RecommendationsList } from '@/components/teacher/RecommendationsList';
import { FocusIntervalsChart } from '@/components/teacher/FocusIntervalsChart';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StudentPdfReport } from '@/components/teacher/StudentPdfReport';


export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isPdfLoading, setIsPdfLoading] = useState(false);


  const studentRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'teachers', user.uid, 'students', params.id);
  }, [firestore, user, params.id]);

  const reportsQuery = useMemoFirebase(() => {
    if(!user) return null;
    return query(
      collection(firestore, 'teachers', user.uid, 'students', params.id, 'dailyReports'),
      orderBy('date', 'desc')
    );
  }, [firestore, user, params.id]);

  const recommendationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'teachers', user.uid, 'students', params.id, 'recommendations'),
        orderBy('createdAt', 'desc'),
        limit(5)
    );
  }, [firestore, user, params.id]);

  const focusIntervalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return query(
        collection(firestore, 'teachers', user.uid, 'students', params.id, 'focusIntervals'),
        where('timestamp', '>=', oneWeekAgo),
        orderBy('timestamp', 'desc')
    );
  }, [firestore, user, params.id]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentRef);
  const { data: reports, isLoading: areReportsLoading } = useCollection<StudentReport>(reportsQuery);
  const { data: recommendations, isLoading: areRecommendationsLoading } = useCollection<StudentRecommendation>(recommendationsQuery);
  const { data: focusIntervals, isLoading: areIntervalsLoading } = useCollection<FocusInterval>(focusIntervalsQuery);


  const isLoading = isStudentLoading || areReportsLoading || areRecommendationsLoading || areIntervalsLoading;
  
  const handleExportStudentData = async () => {
    if (!user || !firestore || !student || !reports) {
         toast({
            title: "خطا",
            description: "داده دانش‌آموز برای خروجی گرفتن آماده نیست.",
            variant: "destructive",
        });
        return;
    }
     toast({
        title: "در حال آماده‌سازی...",
        description: "لطفا صبر کنید، در حال جمع‌آوری اطلاعات دانش‌آموز هستیم.",
    });

    const exportData: any = { ...student, dailyReports: [] };
    
    for (const report of reports) {
      const reportRef = doc(firestore, 'teachers', user.uid, 'students', params.id, 'dailyReports', (report as any).id);
      const subjectItemsQueryRef = query(collection(reportRef, 'subjectItems'));
      
      try {
        const subjectItemsSnapshot = await getDocs(subjectItemsQueryRef);
        const subjectItems = subjectItemsSnapshot.docs.map(doc => doc.data());
        (exportData.dailyReports as any[]).push({ ...report, subjectItems });
      } catch (serverError) {
         const permissionError = new FirestorePermissionError({
            path: subjectItemsQueryRef.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
         toast({
            title: "خطای دسترسی",
            description: "امکان خروجی گرفتن داده‌های درسی به دلیل مشکل در مجوزهای دسترسی وجود ندارد.",
            variant: "destructive",
        });
        return; // Stop the export
      }
    }
    
    downloadJson(exportData, `itab_backup_${student.firstName}_${student.lastName}.json`);
    toast({
        title: "پشتیبان‌گیری کامل شد",
        description: `فایل JSON اطلاعات ${student.firstName} دانلود شد.`,
    });
  };

  const handleDownloadPdf = async () => {
    if (!student) return;
    setIsPdfLoading(true);
    toast({
      title: "در حال تولید گزارش PDF...",
      description: "این فرآیند ممکن است چند لحظه طول بکشد.",
    });

    const reportElement = document.getElementById('pdf-report-content');
    if (!reportElement) {
        toast({ title: "خطا", description: "محتوای گزارش برای تولید PDF یافت نشد.", variant: 'destructive' });
        setIsPdfLoading(false);
        return;
    }
    
    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2, // Increase resolution
            useCORS: true, // For images from other domains
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4',
            hotfixes: ['px_scaling'],
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`Report-${student.firstName}-${student.lastName}-${new Date().toLocaleDateString('fa-IR')}.pdf`);
        toast({ title: "گزارش PDF آماده شد", description: "فایل PDF با موفقیت دانلود شد." });
    } catch (error) {
        console.error("Error generating PDF: ", error);
        toast({ title: "خطا در تولید PDF", description: "مشکلی در هنگام ساخت فایل PDF پیش آمد.", variant: "destructive" });
    } finally {
        setIsPdfLoading(false);
    }
};


  if (isLoading && !isPdfLoading) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex-row items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-80" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                    </CardHeader>
                     <CardContent>
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                    </CardHeader>
                     <CardContent>
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
             </div>
        </div>
    );
  }
  
  if (!student) {
    notFound();
  }

  // Transform Firestore reports for the Genkit flow (limited to last 14 for performance)
  const dailyReportsForGenkit = getDailyReportsForGenkit(reports?.slice(0, 14) || []);

  return (
    <>
      {isPdfLoading && student && (
        <div style={{ position: 'fixed', left: '-2000px', top: 0, direction: 'rtl' }}>
            <div id="pdf-report-content" style={{ width: '800px', padding: '20px', backgroundColor: 'white' }}>
                 <StudentPdfReport 
                    student={student}
                    dailyReports={dailyReportsForGenkit}
                    focusIntervals={focusIntervals || []}
                 />
            </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                  <AvatarImage src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} />
                  <AvatarFallback>{student.firstName?.substring(0, 1)}{student.lastName?.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                  <CardTitle className="font-headline text-2xl">{`${student.firstName} ${student.lastName}`}</CardTitle>
                  <CardDescription>کلاس: {student.gradeLevel} - رشته: {student.major}</CardDescription>
                  </div>
              </div>
              <div className='flex gap-2'>
                <Button variant="outline" onClick={handleExportStudentData}>
                    <Download className="ml-2 h-4 w-4" />
                    خروجی داده (JSON)
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isPdfLoading}>
                    {isPdfLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <FileDown className="ml-2 h-4 w-4" />}
                    دانلود گزارش (PDF)
                </Button>
              </div>
              </CardHeader>
          </Card>
          
          <StudentPerformanceAnalysis studentId={student.id} dailyReports={dailyReportsForGenkit} />

          <FocusIntervalsChart intervals={focusIntervals || []} />

        </div>

        <div className="lg:col-span-2 space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-lg flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          ارسال توصیه جدید
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <RecommendationForm studentId={student.id} />
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-lg">آخرین توصیه‌ها</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <RecommendationsList recommendations={recommendations || []} />
                  </CardContent>
              </Card>
        </div>
      </div>
    </>
  );
}
