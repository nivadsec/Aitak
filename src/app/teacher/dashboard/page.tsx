'use client'

import { AnalyticsDashboard } from '@/components/teacher/AnalyticsDashboard';
import StudentsDataTable from '@/components/teacher/StudentsDataTable';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { collection, query, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherDashboardPage() {
  const { firestore, user } = useFirebase();

  const studentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'teachers', user.uid, 'students'), limit(5));
  }, [firestore, user]);

  const { data: students, isLoading } = useCollection(studentsQuery);

  // Note: We are not fetching reports here for the dashboard overview for performance.
  // The averages in the table will show 'N/A'. This is acceptable for this view.

  return (
    <div className="space-y-6">
      <AnalyticsDashboard />
      <Card>
        <CardHeader className='flex-row items-center justify-between'>
            <div>
                <CardTitle className="font-headline text-xl">نمای کلی دانش‌آموزان</CardTitle>
                <CardDescription>برای مشاهده جزئیات، روی هر دانش‌آموز کلیک کنید.</CardDescription>
            </div>
            <Button asChild variant="outline">
                <Link href="/teacher/students">
                    مشاهده همه
                    <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {isLoading ? (
               <div className="space-y-2">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
               </div>
            ) : (
              <StudentsDataTable students={students || []} reports={[]} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
