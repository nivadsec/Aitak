import { AnalyticsDashboard } from '@/components/teacher/AnalyticsDashboard';
import StudentsDataTable from '@/components/teacher/StudentsDataTable';
import { students, reports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboardPage() {
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
            <StudentsDataTable students={students.slice(0, 5)} reports={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
