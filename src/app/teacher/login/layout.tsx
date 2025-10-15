
import { FirebaseClientProvider } from "@/firebase";

export default function TeacherLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <FirebaseClientProvider>
          {children}
      </FirebaseClientProvider>
  );
}
