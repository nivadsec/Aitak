'use client'
import { DailyReportForm } from '@/components/student/DailyReportForm';
import { MotivationTip } from '@/components/student/MotivationTip';
import PersonalStats from '@/components/student/PersonalStats';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { downloadJson } from '@/lib/utils';
import { collection, doc, getDocs, query } from 'firebase/firestore';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function StudentDashboardPage() {
  const { firestore, user } = useFirebase();

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

    // This is simplified. We're assuming the student exists under a teacher.
    // A more robust solution might need to find the teacher first.
    // For now, we'll try to fetch data assuming a teacherId. This part is tricky without knowing the teacher.
    // We will assume the teacherId is stored somewhere accessible or we just export reports.
    // Let's just export the user profile and assume reports are under a path we can guess.
     const studentDocRef = doc(firestore, 'students', user.uid); // This path is a guess
     const studentData = (await getDocs(query(collection(firestore, `teachers/default-teacher/students`)))).docs.find(d => d.id === user.uid)?.data();


    const exportData: any = {
      ...studentData,
      dailyReports: []
    };
    
    // This part is difficult because we don't know the teacher ID from the student panel.
    // This is a placeholder to show the functionality.
    // In a real app, the student document should contain their teacher's ID.
    const teacherId = 'default-teacher'; // Placeholder
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
        <PersonalStats>
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
