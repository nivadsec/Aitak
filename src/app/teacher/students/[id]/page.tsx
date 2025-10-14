import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getStudentById, getReportsForStudent, getDailyReportsForGenkit } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StudentPerformanceAnalysis from '@/components/teacher/StudentPerformanceAnalysis';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = getStudentById(params.id);
  
  if (!student) {
    notFound();
  }

  const dailyReports = getDailyReportsForGenkit(student.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.avatarUrl} alt={student.name} />
            <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl">{student.name}</CardTitle>
            <CardDescription>کلاس: {student.class}</CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      <StudentPerformanceAnalysis studentId={student.id} dailyReports={dailyReports} />
    </div>
  );
}
