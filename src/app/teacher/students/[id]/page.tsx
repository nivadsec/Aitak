'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StudentPerformanceAnalysis from '@/components/teacher/StudentPerformanceAnalysis';
import { useDoc, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getDailyReportsForGenkit } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadJson } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();

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

  const { data: student, isLoading: isStudentLoading } = useDoc(studentRef);
  const { data: reports, isLoading: areReportsLoading } = useCollection(reportsQuery);

  const isLoading = isStudentLoading || areReportsLoading;
  
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
      const subjectItemsQuery = query(collection(reportRef, 'subjectItems'));
      const subjectItemsSnapshot = await getDocs(subjectItemsQuery);
      const subjectItems = subjectItemsSnapshot.docs.map(doc => doc.data());
      (exportData.dailyReports as any[]).push({ ...report, subjectItems });
    }
    
    downloadJson(exportData, `itab_backup_${student.firstName}_${student.lastName}.json`);
  };


  if (isLoading) {
    return (
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
        </div>
    );
  }
  
  if (!student) {
    notFound();
  }

  // Transform Firestore reports for the Genkit flow (limited to last 14 for performance)
  const dailyReportsForGenkit = getDailyReportsForGenkit(reports?.slice(0, 14) || []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
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
    </div>
  );
}
