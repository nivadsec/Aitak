'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { Edit, MoreVertical, Trash2, AlertTriangle, ClipboardList, BarChart2 } from 'lucide-react';

import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirebase } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import type { Test } from '@/lib/types';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface TestsListProps {
  tests: Test[];
}

export function TestsList({ tests }: TestsListProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [deletingTest, setDeletingTest] = React.useState<Test | null>(null);

  const handleDelete = (testId: string) => {
    if (!user) return;
    const testRef = doc(firestore, 'teachers', user.uid, 'tests', testId);
    deleteDocumentNonBlocking(testRef);
    setDeletingTest(null);
    toast({
      title: "آزمون حذف شد",
      description: "آزمون مورد نظر با موفقیت حذف شد.",
      variant: 'destructive',
      className: 'font-body',
    });
  };

  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">هیچ آزمونی یافت نشد</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          برای ایجاد اولین آزمون، روی دکمه "آزمون جدید" کلیک کنید.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tests.map((t) => (
          <Card key={t.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg font-headline">{t.title}</CardTitle>
                <CardDescription>
                  {t.questions.length} سوال | ساخته شده در: {new Date(t.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                     <Link href={`/teacher/tests/results/${t.id}`}>
                        <BarChart2 className="ml-2 h-4 w-4" />
                        مشاهده نتایج
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/tests/edit/${t.id}`}>
                      <Edit className="ml-2 h-4 w-4" />
                      ویرایش
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => setDeletingTest(t)}
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={!!deletingTest} onOpenChange={(open) => !open && setDeletingTest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              آیا از حذف آزمون مطمئن هستید؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              این عمل قابل بازگشت نیست و آزمون برای همیشه حذف خواهد شد. تمام نتایج ثبت شده توسط دانش‌آموزان نیز حذف می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => handleDelete(deletingTest!.id)}
            >
              حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
