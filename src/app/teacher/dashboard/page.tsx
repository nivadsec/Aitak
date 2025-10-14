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
import { AnnouncementForm } from '@/components/teacher/AnnouncementForm';

export default function TeacherDashboardPage() {
  const { firestore, user } = useFirebase();

  // Query only for students, not their reports for this high-level view
  const studentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'teachers', user.uid, 'students'), limit(5));
  }, [firestore, user]);

  const { data: students, isLoading: areStudentsLoading } = useCollection(studentsQuery);

  // We are not fetching reports here for the dashboard overview for performance.
  // The averages in the table will show 'N/A'. This is acceptable for this view.
  // The full data is loaded on the dedicated students page.

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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
              {areStudentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                // Pass an empty array for reports, as we are not fetching them here.
                <StudentsDataTable students={students || []} reports={[]} />
              )}
          </CardContent>
        </Card>
      </div>
       <div className="space-y-6">
          <AnnouncementForm />
      </div>
    </div>
  );
}
