'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StudentPerformanceAnalysis from '@/components/teacher/StudentPerformanceAnalysis';
import { useDoc, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { getDailyReportsForGenkit } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();

  const studentRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'teachers', user.uid, 'students', params.id);
  }, [firestore, user, params.id]);

  const reportsQuery = useMemoFirebase(() => {
    if(!user) return null;
    return query(
      collection(firestore, 'teachers', user.uid, 'students', params.id, 'dailyReports'),
      orderBy('date', 'desc'),
      limit(14) // Get last 2 weeks of reports for analysis
    );
  }, [firestore, user, params.id]);

  const { data: student, isLoading: isStudentLoading } = useDoc(studentRef);
  const { data: reports, isLoading: areReportsLoading } = useCollection(reportsQuery);

  const isLoading = isStudentLoading || areReportsLoading;

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

  // Transform Firestore reports for the Genkit flow
  const dailyReportsForGenkit = getDailyReportsForGenkit(reports || []);

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
      
      <StudentPerformanceAnalysis studentId={student.id} dailyReports={dailyReportsForGenkit} />
    </div>
  );
}
