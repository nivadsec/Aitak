
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, PlusCircle } from 'lucide-react';
import { QuizForm } from '@/components/teacher/QuizForm';
import { QuizzesList } from '@/components/teacher/QuizzesList';


export default function TeacherQuizzesPage() {
    const { firestore, user } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingQuiz, setEditingQuiz] = React.useState<Quiz | undefined>(undefined);


    const quizzesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'quizzes'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: quizzes, isLoading } = useCollection<Quiz>(quizzesQuery);
    
    const openNewDialog = () => {
        setEditingQuiz(undefined);
        setIsDialogOpen(true);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="space-y-6">
                 <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline text-xl flex items-center gap-2">
                                <FileText />
                                مدیریت آزمون‌ها
                            </CardTitle>
                            <CardDescription>
                                آزمون‌های جدید ایجاد کنید، آزمون‌های قبلی را ویرایش یا حذف کنید و نتایج را مشاهده نمایید.
                            </CardDescription>
                        </div>
                         <Button onClick={openNewDialog}>
                            <PlusCircle className="ml-2 h-4 w-4" />
                            آزمون جدید
                        </Button>
                    </CardHeader>
                     <CardContent>
                        {isLoading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ) : (
                            <QuizzesList quizzes={quizzes || []} setEditingQuiz={(quiz) => { setEditingQuiz(quiz); setIsDialogOpen(true); }} />
                        )}
                    </CardContent>
                </Card>
                 <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                     <DialogHeader>
                        <DialogTitle className="font-headline flex items-center gap-2">
                            <FileText />
                            {editingQuiz ? 'ویرایش آزمون' : 'ایجاد آزمون جدید'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingQuiz ? 'اطلاعات و سوالات آزمون را ویرایش کنید.' : 'اطلاعات و سوالات آزمون را وارد کنید.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto -mx-6 px-6">
                        <QuizForm quiz={editingQuiz} onSuccess={() => setIsDialogOpen(false)} />
                    </div>
                </DialogContent>
            </div>
        </Dialog>
    )
}

    