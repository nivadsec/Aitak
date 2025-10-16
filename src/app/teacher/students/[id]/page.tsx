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
import { Download, Lightbulb } from 'lucide-react';
import { downloadJson } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RecommendationForm } from '@/components/teacher/RecommendationForm';
import type { StudentRecommendation, FocusInterval } from '@/lib/types';
import { RecommendationsList } from '@/components/teacher/RecommendationsList';
import { FocusIntervalsChart } from '@/components/teacher/FocusIntervalsChart';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

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

  const { data: student, isLoading: isStudentLoading } = useDoc(studentRef);
  const { data: reports, isLoading: areReportsLoading } = useCollection(reportsQuery);
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


  if (isLoading) {
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                <AvatarImage src={(student as any).avatarUrl} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback>{student.firstName?.substring(0, 1)}{student.lastName?.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                <CardTitle className="font-headline text-2xl">{`${student.firstName} ${student.lastName}`}</CardTitle>
                <CardDescription>کلاس: {student.gradeLevel} - رشته: {student.major}</CardDescription>
                </div>
            </div>
            <Button variant="outline" onClick={handleExportStudentData}>
                <Download className="ml-2 h-4 w-4" />
                خروجی داده‌های دانش‌آموز
            </Button>
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
  );
}
