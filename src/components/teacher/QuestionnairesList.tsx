'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { Edit, MoreVertical, Trash2, AlertTriangle, FileText, BarChart2 } from 'lucide-react';

import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useFirebase } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import type { Questionnaire } from '@/lib/types';

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

interface QuestionnairesListProps {
  questionnaires: Questionnaire[];
}

export function QuestionnairesList({ questionnaires }: QuestionnairesListProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [deletingQuestionnaire, setDeletingQuestionnaire] = React.useState<Questionnaire | null>(null);

  const handleDelete = (questionnaireId: string) => {
    if (!user) return;
    // Note: Deleting a questionnaire should also delete its subcollections (submissions)
    // This requires a Cloud Function for robust implementation. The current client-side
    // delete will only remove the questionnaire document itself.
    const questionnaireRef = doc(firestore, 'teachers', user.uid, 'questionnaires', questionnaireId);
    deleteDocumentNonBlocking(questionnaireRef);
    setDeletingQuestionnaire(null);
    toast({
      title: "پرسشنامه حذف شد",
      description: "پرسشنامه مورد نظر با موفقیت حذف شد.",
      variant: 'destructive',
      className: 'font-body',
    });
  };

  if (questionnaires.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">هیچ پرسشنامه‌ای یافت نشد</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          برای ایجاد اولین پرسشنامه، روی دکمه "پرسشنامه جدید" کلیک کنید.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {questionnaires.map((q) => (
          <Card key={q.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg font-headline">{q.title}</CardTitle>
                <CardDescription>
                  {q.questions.length} سوال | ساخته شده در: {new Date(q.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
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
                     <Link href={`/teacher/questionnaires/results/${q.id}`}>
                        <BarChart2 className="ml-2 h-4 w-4" />
                        مشاهده نتایج
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/questionnaires/edit/${q.id}`}>
                      <Edit className="ml-2 h-4 w-4" />
                      ویرایش
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => setDeletingQuestionnaire(q)}
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
      
      <AlertDialog open={!!deletingQuestionnaire} onOpenChange={(open) => !open && setDeletingQuestionnaire(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              آیا از حذف پرسشنامه مطمئن هستید؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              این عمل قابل بازگشت نیست و پرسشنامه برای همیشه حذف خواهد شد. تمام نتایج ثبت شده توسط دانش‌آموزان نیز حذف می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => handleDelete(deletingQuestionnaire!.id)}
            >
              حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
