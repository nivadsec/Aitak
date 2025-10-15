'use client'

import React, { useMemo } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Download, Megaphone, PlusCircle } from 'lucide-react';
import { subDays, format, eachDayOfInterval, isSameDay } from 'date-fns';

import { AnalyticsDashboard } from '@/components/teacher/AnalyticsDashboard';
import StudentsDataTable from '@/components/teacher/StudentsDataTable';
import { useCollection, useFirebase, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnnouncementForm } from '@/components/teacher/AnnouncementForm';
import { downloadJson } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { StudentReport } from '@/lib/types';


// Helper function to process reports for analytics
const processReportsForAnalytics = (reports: StudentReport[]) => {
  // Weekly Study Trend
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const weeklyStudyData = last7Days.map(day => {
    const reportsForDay = reports.filter(r => isSameDay(new Date(r.date), day));
    const totalMinutes = reportsForDay.reduce((sum, report) => {
        return sum + (report.items || []).reduce((itemSum, item) => itemSum + (item.studyTime || 0), 0);
    }, 0);
    const uniqueStudents = new Set(reportsForDay.map(r => r.studentId)).size;
    const avgHours = uniqueStudents > 0 ? (totalMinutes / uniqueStudents) / 60 : 0;
    
    return {
      day: format(day, 'E'), // 'Mon', 'Tue', etc.
      hours: parseFloat(avgHours.toFixed(1)),
    };
  });

  // Subject Distribution
  const subjectDistributionMap = new Map<string, number>();
  reports.forEach(report => {
    (report.items || []).forEach(item => {
      const currentMinutes = subjectDistributionMap.get(item.subject) || 0;
      subjectDistributionMap.set(item.subject, currentMinutes + (item.studyTime || 0));
    });
  });
  
  const subjectDistributionData = Array.from(subjectDistributionMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);


  // Aggregated stats
   const totalStudyMinutes = reports.reduce((sum, report) => sum + (report.items || []).reduce((itemSum, item) => itemSum + (item.studyTime || 0), 0), 0);
   const totalMobileHours = reports.reduce((sum, report) => sum + (report.mobileHours || 0), 0);
   const totalMoodScore = reports.reduce((sum, report) => sum + (report.moodScore || 0), 0);
   const uniqueReportDays = new Set(reports.map(r => r.date)).size;

   const avgDailyStudyHours = uniqueReportDays > 0 ? (totalStudyMinutes / uniqueReportDays) / 60 : 0;
   const avgDailyMobileHours = uniqueReportDays > 0 ? totalMobileHours / uniqueReportDays : 0;
   const avgMood = reports.length > 0 ? totalMoodScore / reports.length : 0;

  return { 
      weeklyStudyData,
      subjectDistributionData,
      overallStats: {
        avgDailyStudyHours: avgDailyStudyHours.toFixed(1),
        avgDailyMobileHours: avgDailyMobileHours.toFixed(1),
        avgMood: avgMood.toFixed(1),
      }
   };
};


export default function TeacherDashboardPage() {
  const { firestore, user } = useFirebase();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [allReports, setAllReports] = React.useState<StudentReport[]>([]);
  const [areReportsLoading, setAreReportsLoading] = React.useState(true);
  const { toast } = useToast();

  // 1. Fetch students
  const studentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'teachers', user.uid, 'students'));
  }, [firestore, user]);

  const { data: students, isLoading: areStudentsLoading } = useCollection(studentsQuery);

  // 2. Fetch all reports for all students
  React.useEffect(() => {
    if (!user || !students) {
      if (students === null && !areStudentsLoading) {
         setAreReportsLoading(false); // No students, so no reports to load
      }
      return;
    }

    setAreReportsLoading(true);
    const fetchAllReports = async () => {
      const reportsPromises = students.map(student => {
        const reportsRef = collection(firestore, 'teachers', user.uid, 'students', student.id, 'dailyReports');
        return getDocs(query(reportsRef)).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: reportsRef.path,
                operation: 'list'
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
      });
      const reportsSnapshots = await Promise.all(reportsPromises);
      const reports = reportsSnapshots.flatMap(snapshot => snapshot.docs.map(doc => doc.data() as StudentReport));
      setAllReports(reports);
      setAreReportsLoading(false);
    };

    fetchAllReports();
  }, [user, firestore, students, areStudentsLoading]);

  const analyticsData = useMemo(() => {
    if (!allReports || allReports.length === 0) return null;
    return processReportsForAnalytics(allReports);
  }, [allReports]);


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
        const reportsQueryRef = query(collection(firestore, 'teachers', user.uid, 'students', student.id, 'dailyReports'));
        
        try {
            const reportsSnapshot = await getDocs(reportsQueryRef);
            
            for (const reportDoc of reportsSnapshot.docs) {
                const reportData = reportDoc.data();
                const subjectItemsQueryRef = query(collection(reportDoc.ref, 'subjectItems'));
                const subjectItemsSnapshot = await getDocs(subjectItemsQueryRef);
                const subjectItems = subjectItemsSnapshot.docs.map(doc => doc.data());
                (reportData as any).subjectItems = subjectItems;
                studentData.dailyReports.push(reportData);
            }
            (exportData.students as any[]).push(studentData);
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({
                path: reportsQueryRef.path, // This is an approximation. The error could be on subjectItems.
                operation: 'list'
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: "خطای دسترسی",
                description: "امکان خروجی گرفتن داده‌ها به دلیل مشکل در مجوزهای دسترسی وجود ندارد.",
                variant: "destructive",
            });
            return; // Stop the export process
        }
    }
    
    downloadJson(exportData, `itab_backup_all_${new Date().toISOString().split('T')[0]}.json`);
  };
  
  const isLoading = areStudentsLoading || areReportsLoading;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        <AnalyticsDashboard 
          isLoading={isLoading} 
          analyticsData={analyticsData} 
          studentCount={students?.length || 0}
        />
        
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
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <StudentsDataTable students={students || []} reports={allReports || []} />
              )}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Megaphone />
                        ارسال اطلاعیه سریع
                    </CardTitle>
                    <CardDescription>
                        این اطلاعیه در صفحه اصلی برای همه نمایش داده می‌شود.
                    </CardDescription>
                </div>
                 <DialogTrigger asChild>
                    <Button variant="outline">
                        <PlusCircle className="ml-2 h-4 w-4" />
                        اطلاعیه جدید
                    </Button>
                </DialogTrigger>
            </CardHeader>
            <CardContent>
                <AnnouncementForm onSuccess={() => {}} announcement={null} />
            </CardContent>
        </Card>

        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2">
                <Megaphone />
                ارسال اطلاعیه عمومی
            </DialogTitle>
            <DialogDescription>
                این اطلاعیه برای همه کاربران در صفحه اصلی نمایش داده می‌شود.
            </DialogDescription>
            </DialogHeader>
            <AnnouncementForm onSuccess={() => setIsDialogOpen(false)} announcement={null} />
        </DialogContent>
      </div>
    </Dialog>
  );
}
