'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StudentPerformanceAnalysis from '@/components/teacher/StudentPerformanceAnalysis';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getDailyReportsForGenkit } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();

  const studentRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'teachers', user.uid, 'students', params.id);
  }, [firestore, user, params.id]);

  const { data: student, isLoading } = useDoc(studentRef);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (!student) {
    notFound();
  }

  // TODO: Replace with actual report data from Firestore
  const dailyReports = getDailyReportsForGenkit(student.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={(student as any).avatarUrl} alt={`${student.firstName} ${student.lastName}`} />
            <AvatarFallback>{student.firstName?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl">{`${student.firstName} ${student.lastName}`}</CardTitle>
            <CardDescription>کلاس: {student.gradeLevel} - رشته: {student.major}</CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      <StudentPerformanceAnalysis studentId={student.id} dailyReports={dailyReports} />
    </div>
  );
}
