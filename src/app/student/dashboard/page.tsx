'use client'
import { DailyReportForm } from '@/components/student/DailyReportForm';
import { MotivationTip } from '@/components/student/MotivationTip';
import PersonalStats from '@/components/student/PersonalStats';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { downloadJson } from '@/lib/utils';
import { collection, doc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { StudentReport } from '@/lib/types';

export default function StudentDashboardPage() {
  const { firestore, user } = useFirebase();

  // Fetch the latest report for analytics
  const latestReportQuery = useMemoFirebase(() => {
    if (!user) return null;
    // Assuming a teacherId is needed. We'll use a placeholder for now.
    // In a real app, the student's document would contain their teacherId.
    const teacherId = 'default-teacher'; // Placeholder
    return query(
        collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports'),
        orderBy('date', 'desc'),
        limit(1)
    );
  }, [firestore, user]);

  const { data: latestReports, isLoading: isReportLoading } = useCollection<StudentReport>(latestReportQuery);
  const latestReport = latestReports?.[0];

  const handleExportData = async () => {
     if (!user || !firestore) {
        toast({
            title: "خطا",
            description: "برای خروجی گرفتن باید وارد شده باشید.",
            variant: "destructive",
        });
        return;
    }
    toast({
        title: "در حال آماده‌سازی...",
        description: "لطفا صبر کنید، در حال جمع‌آوری اطلاعات شما هستیم.",
    });

    const teacherId = 'default-teacher'; // Placeholder
    const studentDocRef = doc(firestore, 'teachers', teacherId, 'students', user.uid);
    const studentData = (await getDocs(query(collection(firestore, `teachers/${teacherId}/students`)))).docs.find(d => d.id === user.uid)?.data();


    const exportData: any = {
      ...studentData,
      dailyReports: []
    };
    
    const reportsQuery = query(collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports'));
    const reportsSnapshot = await getDocs(reportsQuery);

     for (const reportDoc of reportsSnapshot.docs) {
        const reportData = reportDoc.data();
        const subjectItemsQuery = query(collection(reportDoc.ref, 'subjectItems'));
        const subjectItemsSnapshot = await getDocs(subjectItemsQuery);
        const subjectItems = subjectItemsSnapshot.docs.map(doc => doc.data());
        (reportData as any).subjectItems = subjectItems;
        exportData.dailyReports.push(reportData);
    }

    downloadJson(exportData, `itab_backup_student_${user.displayName?.replace(' ', '_')}.json`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <DailyReportForm />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <PersonalStats report={latestReport} isLoading={isReportLoading}>
          <MotivationTip />
        </PersonalStats>
         <div className="text-center">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="ml-2 h-4 w-4" />
              پشتیبان‌گیری از اطلاعات من
            </Button>
          </div>
      </div>
    </div>
  );
}
