
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, ArrowLeft, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const StudentAccessRow = React.memo(({ student }: { student: Student }) => {
  return (
    <div className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={student.avatarUrl} />
          <AvatarFallback>{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-medium leading-none">{student.firstName} {student.lastName}</p>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={`/teacher/students/${student.id}/settings`}>
          <Settings className="ml-2 h-4 w-4" />
          مدیریت دسترسی
        </Link>
      </Button>
    </div>
  );
});
StudentAccessRow.displayName = 'StudentAccessRow';


export default function TeacherPermissionsPage() {
    const { firestore, user } = useFirebase();

    const studentsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'students'));
    }, [firestore, user]);

    const { data: students, isLoading } = useCollection<Student>(studentsQuery);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        مدیریت دسترسی دانش‌آموزان
                    </CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید قابلیت‌های مختلف پنل را برای هر دانش‌آموز فعال یا غیرفعال کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">لیست دانش‌آموزان</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {students && students.length > 0 ? (
                                students.map(student => (
                                    <StudentAccessRow key={student.id} student={student} />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    هنوز دانش‌آموزی برای مدیریت وجود ندارد.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
