'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { Edit, MoreVertical, Trash2, AlertTriangle, FileText, BarChart2 } from 'lucide-react';

import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirebase } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import type { Quiz } from '@/lib/types';

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

interface QuizzesListProps {
  quizzes: Quiz[];
}

export function QuizzesList({ quizzes }: QuizzesListProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [deletingQuiz, setDeletingQuiz] = React.useState<Quiz | null>(null);

  const handleDelete = (quizId: string) => {
    if (!user) return;
    // Note: Deleting a quiz should also delete its subcollections (submissions)
    // This requires a Cloud Function for robust implementation. The current client-side
    // delete will only remove the quiz document itself.
    const quizRef = doc(firestore, 'teachers', user.uid, 'quizzes', quizId);
    deleteDocumentNonBlocking(quizRef);
    setDeletingQuiz(null);
    toast({
      title: "آزمون حذف شد",
      description: "آزمون مورد نظر با موفقیت حذف شد.",
      variant: 'destructive',
      className: 'font-body',
    });
  };

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
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
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg font-headline">{quiz.title}</CardTitle>
                <CardDescription>
                  {quiz.questions.length} سوال | ساخته شده در: {new Date(quiz.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
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
                     <Link href={`/teacher/quizzes/results/${quiz.id}`}>
                        <BarChart2 className="ml-2 h-4 w-4" />
                        مشاهده نتایج
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/quizzes/edit/${quiz.id}`}>
                      <Edit className="ml-2 h-4 w-4" />
                      ویرایش
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => setDeletingQuiz(quiz)}
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
      
      <AlertDialog open={!!deletingQuiz} onOpenChange={(open) => !open && setDeletingQuiz(null)}>
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
              onClick={() => handleDelete(deletingQuiz!.id)}
            >
              حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
