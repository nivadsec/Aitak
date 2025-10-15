'use client'
import { DailyReportForm } from '@/components/student/DailyReportForm';
import { MotivationTip } from '@/components/student/MotivationTip';
import PersonalStats from '@/components/student/PersonalStats';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { downloadJson } from '@/lib/utils';
import { collection, doc, getDocs, query, orderBy, limit, getDoc } from 'firebase/firestore';
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

    const latestStudyTime = (latest.items || []).reduce((sum, item) => sum + (item.studyTime || 0), 0);
    const previousStudyTime = (previous.items || []).reduce((sum, item) => sum + (item.studyTime || 0), 0);

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
  const { firestore, user, role } = useFirebase();
  const { toast } = useToast();
  
  // The teacherId is now extracted from the role string "student:teacherId"
  const teacherId = role?.split(':')[1];

  // Fetch the latest 2 reports for analytics and trend analysis
  const reportsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !teacherId) return null;
    return query(
        collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports'),
        orderBy('date', 'desc'),
        limit(2) // Fetch last two reports for trend analysis
    );
  }, [firestore, user, teacherId]);

  const { data: reports, isLoading: isReportLoading } = useCollection<StudentReport>(reportsQuery);
  
  const latestReport = reports?.[0];
  const trendDescription = React.useMemo(() => reports ? createTrendDescription(reports) : undefined, [reports]);


  const handleExportData = async () => {
     if (!user || !firestore || !teacherId) {
        toast({
            title: "خطا",
            description: "برای خروجی گرفتن باید وارد شده باشید و اطلاعات شما در دسترس باشد.",
            variant: "destructive",
        });
        return;
    }
    toast({
        title: "در حال آماده‌سازی...",
        description: "لطفا صبر کنید، در حال جمع‌آوری اطلاعات شما هستیم.",
    });

    const studentDocRef = doc(firestore, `teachers/${teacherId}/students`, user.uid);
    const studentDocSnap = await getDoc(studentDocRef).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: studentDocRef.path,
            operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError; // Stop further execution
    });
    
    const fullStudentData = studentDocSnap.exists() ? studentDocSnap.data() : {};

    const exportData: any = {
      ...fullStudentData,
      dailyReports: []
    };
    
    const reportsCollectionRef = collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports');
    const reportsSnapshot = await getDocs(reportsCollectionRef).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: reportsCollectionRef.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError; // Stop further execution
    });

     for (const reportDoc of reportsSnapshot.docs) {
        const reportData = reportDoc.data();
        const subjectItemsQuery = query(collection(reportDoc.ref, 'subjectItems'));
        const subjectItemsSnapshot = await getDocs(subjectItemsQuery).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: collection(reportDoc.ref, 'subjectItems').path,
                operation: 'list'
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // Stop further execution
        });
        const subjectItems = subjectItemsSnapshot.docs.map(d => d.data());
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
            <Button variant="outline" onClick={handleExportData} disabled={!user || !teacherId}>
              <Download className="ml-2 h-4 w-4" />
              پشتیبان‌گیری از اطلاعات من
            </Button>
          </div>
      </div>
    </div>
  );
}
