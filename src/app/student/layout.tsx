'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { StudyAssistant } from '@/components/assistant/StudyAssistant';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import type { Student } from '@/lib/types';
import { doc } from 'firebase/firestore';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, firestore, role } = useFirebase();
  const teacherId = role?.split(':')[1];

  const studentRef = useMemoFirebase(() => {
    if (!user || !teacherId) return null;
    return doc(firestore, 'teachers', teacherId, 'students', user.uid);
  }, [firestore, user, teacherId]);

  const { data: student } = useDoc<Student>(studentRef);

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
