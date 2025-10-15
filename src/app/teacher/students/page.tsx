'use client';

import * as React from 'react';
import { PlusCircle } from 'lucide-react';

import StudentsDataTable from '@/components/teacher/StudentsDataTable';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StudentForm } from '@/components/teacher/StudentForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentsPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { firestore, user } = useFirebase();

  const studentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'teachers', user.uid, 'students'));
  }, [firestore, user]);

  const { data: students, isLoading } = useCollection(studentsQuery);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl">
              مدیریت دانش‌آموزان
            </CardTitle>
            <CardDescription>
              افزودن، ویرایش و مشاهده گزارش‌های دانش‌آموزان
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن دانش‌آموز
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <div className="rounded-md border">
                <div className="flex items-center justify-between border-b p-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-8" />
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b p-4 last:border-b-0">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <StudentsDataTable students={students || []} reports={[]} />
            </div>
          )}
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">افزودن دانش‌آموز جدید</DialogTitle>
          <DialogDescription>
            اطلاعات دانش‌آموز را وارد کرده و برای او یک حساب کاربری ایجاد کنید.
          </DialogDescription>
        </DialogHeader>
        <StudentForm
          onSuccess={() => setIsDialogOpen(false)}
          onCancel={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
