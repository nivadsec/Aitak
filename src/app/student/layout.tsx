
'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { StudyAssistant } from '@/components/assistant/StudyAssistant';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import type { Student } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const featureMap: Record<string, keyof Student> = {
    '/student/stats': 'canViewStats',
    '/student/schedule': 'canViewSchedule',
    '/student/quizzes': 'canViewQuizzes',
    '/student/weekly-progress': 'canSubmitWeeklyReport',
    '/student/exam-analysis': 'canSubmitExamAnalysis',
    '/student/focus': 'canSubmitFocusLadder',
    '/student/topic-investment': 'canSubmitTopicInvestment',
    '/student/strategic-plans': 'canViewStrategicPlans',
};


export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, firestore, role } = useFirebase();
  const teacherId = role?.split(':')[1];
  const router = useRouter();
  const pathname = usePathname();

  const studentRef = useMemoFirebase(() => {
    if (!user || !teacherId) return null;
    return doc(firestore, 'teachers', teacherId, 'students', user.uid);
  }, [firestore, user, teacherId]);

  const { data: student, isLoading } = useDoc<Student>(studentRef);

  useEffect(() => {
    if (!isLoading && student) {
      const requiredFeature = Object.keys(featureMap).find(path => pathname.startsWith(path));
      if (requiredFeature) {
        const featureFlag = featureMap[requiredFeature];
        if (student[featureFlag] === false) { // Explicitly check for false
          router.push('/student/dashboard');
        }
      }
    }
  }, [pathname, student, isLoading, router]);


  return (
      <SidebarProvider>
        <AppSidebar role="student" />
        <SidebarInset>
          <AppHeader role="student" />
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
        {student?.assistantEnabled && <StudyAssistant />}
      </SidebarProvider>
  );
}
