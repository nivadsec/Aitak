
'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { StudyAssistant } from '@/components/assistant/StudyAssistant';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import type { Student } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb } from 'lucide-react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, firestore, role } = useFirebase();
  const teacherId = role?.split(':')[1];
  const { toast } = useToast();
  
  const studentRef = useMemoFirebase(() => {
    if (!user || !teacherId) return null;
    return doc(firestore, 'teachers', teacherId, 'students', user.uid);
  }, [firestore, user, teacherId]);

  const { data: student } = useDoc<Student>(studentRef);

  useEffect(() => {
    // Show a toast to encourage using the assistant, but only sometimes.
    const showAssistantToast = () => {
      // Only show ~30% of the time to avoid being annoying.
      if (Math.random() < 0.3) {
        setTimeout(() => {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <span className="font-headline">میتونی از مشاور هوشمند آی‌تاب سوال بپرسی!</span>
              </div>
            ),
            description: "روی آیکون ربات کلیک کن و سوالات درسیت رو بپرس.",
          });
        }, 5000); // Show after 5 seconds
      }
    };
    
    if (student?.assistantEnabled) {
      showAssistantToast();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.assistantEnabled, toast]);


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
