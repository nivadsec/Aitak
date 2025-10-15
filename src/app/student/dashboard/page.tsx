'use client'
import { DailyReportForm } from '@/components/student/DailyReportForm';
import { MotivationTip } from '@/components/student/MotivationTip';
import PersonalStats from '@/components/student/PersonalStats';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { downloadJson } from '@/lib/utils';
import { collection, doc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StudentReport } from '@/lib/types';
import React from 'react';

// Helper function to create a simple trend description
const createTrendDescription = (reports: StudentReport[]): string => {
    if (reports.length < 2) {
        return "گزارش‌های کافی برای تحلیل روند وجود ندارد.";
    }
    const latest = reports[0];
    const previous = reports[1];

    const latestStudyTime = latest.items.reduce((sum, item) => sum + (item.studyTime || 0), 0);
    const previousStudyTime = previous.items.reduce((sum, item) => sum + (item.studyTime || 0), 0);

    let trend = "";
    if (latestStudyTime > previousStudyTime) {
        trend += "افزایش در ساعت مطالعه";
    } else if (latestStudyTime < previousStudyTime) {
        trend += "کاهش در ساعت مطالعه";
    } else {
        trend += "ثبات در ساعت مطالعه";
    }

    if (latest.moodScore > previous.moodScore) {
        trend += " و بهبود در وضعیت روانی";
    } else if (latest.moodScore < previous.moodScore) {
        trend += " و افت در وضعیت روانی";
    }

    return trend + ".";
};


export default function StudentDashboardPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  // Fetch the latest 2 reports for analytics and trend analysis
  const reportsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // This logic assumes a student is associated with a teacher.
    // In a more robust app, the student's doc would contain their teacher's ID.
    // We'll use a placeholder 'default-teacher' for now.
    const teacherId = 'default-teacher'; 
    return query(
        collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports'),
        orderBy('date', 'desc'),
        limit(2) // Fetch last two reports for trend analysis
    );
  }, [firestore, user]);

  const { data: reports, isLoading: isReportLoading } = useCollection<StudentReport>(reportsQuery);
  
  const latestReport = reports?.[0];
  const trendDescription = React.useMemo(() => reports ? createTrendDescription(reports) : undefined, [reports]);


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
    // Fetch student data. This assumes student data exists.
    const studentQuery = query(collection(firestore, `teachers/${teacherId}/students`));
    const studentSnapshot = await getDocs(studentQuery);
    const studentData = studentSnapshot.docs.find(d => d.id === user.uid)?.data();


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

    downloadJson(exportData, `itab_backup_${user.displayName?.replace(' ', '_') || user.uid}.json`);
     toast({
        title: "پشتیبان‌گیری کامل شد",
        description: "فایل JSON اطلاعات شما دانلود شد.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <DailyReportForm />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <PersonalStats report={latestReport} isLoading={isReportLoading}>
          <MotivationTip 
            reportTrends={trendDescription} 
            studentName={user?.displayName?.split(' ')[0]} 
          />
        </PersonalStats>
         <div className="text-center">
            <Button variant="outline" onClick={handleExportData} disabled={!user}>
              <Download className="ml-2 h-4 w-4" />
              پشتیبان‌گیری از اطلاعات من
            </Button>
          </div>
      </div>
    </div>
  );
}
