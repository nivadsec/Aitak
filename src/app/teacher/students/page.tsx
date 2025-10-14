import StudentsDataTable from '@/components/teacher/StudentsDataTable';
import { students, reports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function StudentsPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-xl">مدیریت دانش‌آموزان</CardTitle>
          <CardDescription>افزودن، ویرایش و مشاهده گزارش‌های دانش‌آموزان</CardDescription>
        </div>
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" />
          افزودن دانش‌آموز
        </Button>
      </CardHeader>
      <CardContent>
        <StudentsDataTable students={students} reports={reports} />
      </CardContent>
    </Card>
  );
}
