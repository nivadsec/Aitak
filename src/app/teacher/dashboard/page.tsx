'use client'

import { AnalyticsDashboard } from '@/components/teacher/AnalyticsDashboard';
import StudentsDataTable from '@/components/teacher/StudentsDataTable';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AnnouncementForm } from '@/components/teacher/AnnouncementForm';
import { downloadJson } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function TeacherDashboardPage() {
  const { firestore, user } = useFirebase();

  // Query only for students, not their reports for this high-level view
  const studentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'teachers', user.uid, 'students'));
  }, [firestore, user]);

  const { data: students, isLoading: areStudentsLoading } = useCollection(studentsQuery);

  const handleExportAllData = async () => {
    if (!user || !firestore || !students) {
        toast({
            title: "خطا",
            description: "داده‌ای برای خروجی گرفتن وجود ندارد.",
            variant: "destructive",
        });
        return;
    }

    toast({
        title: "در حال آماده‌سازی...",
        description: "لطفا صبر کنید، در حال جمع‌آوری تمام اطلاعات هستیم.",
    });

    const exportData: any = {
        teacherId: user.uid,
        students: [],
    };

    for (const student of students) {
        const studentData: any = { ...student, dailyReports: [] };
        const reportsQuery = query(collection(firestore, 'teachers', user.uid, 'students', student.id, 'dailyReports'));
        const reportsSnapshot = await getDocs(reportsQuery);
        
        for (const reportDoc of reportsSnapshot.docs) {
            const reportData = reportDoc.data();
            const subjectItemsQuery = query(collection(reportDoc.ref, 'subjectItems'));
            const subjectItemsSnapshot = await getDocs(subjectItemsQuery);
            const subjectItems = subjectItemsSnapshot.docs.map(doc => doc.data());
            (reportData as any).subjectItems = subjectItems;
            studentData.dailyReports.push(reportData);
        }
        (exportData.students as any[]).push(studentData);
    }
    
    downloadJson(exportData, `smartcalm_backup_all_${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <AnalyticsDashboard />
        <Card>
          <CardHeader className='flex-row items-center justify-between'>
              <div>
                  <CardTitle className="font-headline text-xl">نمای کلی دانش‌آموزان</CardTitle>
                  <CardDescription>برای مشاهده جزئیات، روی هر دانش‌آموز کلیک کنید.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                    <Link href="/teacher/students">
                        مشاهده همه
                        <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                </Button>
                 <Button variant="outline" onClick={handleExportAllData} disabled={areStudentsLoading || !students?.length}>
                    <Download className="ml-2 h-4 w-4" />
                    خروجی کل داده‌ها
                </Button>
              </div>
          </CardHeader>
          <CardContent>
              {areStudentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <StudentsDataTable students={students || []} reports={[]} />
              )}
          </CardContent>
        </Card>
      </div>
       <div className="space-y-6">
          <AnnouncementForm />
      </div>
    </div>
  );
}
