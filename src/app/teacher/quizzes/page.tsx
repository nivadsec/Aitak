'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, PlusCircle } from 'lucide-react';
import { QuizzesList } from '@/components/teacher/QuizzesList';
import Link from 'next/link';

export default function TeacherQuizzesPage() {
    const { firestore, user } = useFirebase();

    const quizzesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'quizzes'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: quizzes, isLoading } = useCollection<Quiz>(quizzesQuery);

    return (
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
                     <Button asChild>
                        <Link href="/teacher/quizzes/new">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            آزمون جدید
                        </Link>
                    </Button>
                </CardHeader>
                 <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : (
                        <QuizzesList quizzes={quizzes || []} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
