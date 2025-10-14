import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { FirebaseClientProvider } from '@/firebase';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <AppSidebar role="student" />
        <SidebarInset>
          <AppHeader role="student" />
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
