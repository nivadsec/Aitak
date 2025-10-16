'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function QuizItem({ quiz }: { quiz: Quiz }) {
    return (
        <Link href={`/student/quizzes/${quiz.id}`} className="block">
            <Card className="hover:border-primary/50 hover:bg-muted/50 transition-all">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-lg">{quiz.title}</CardTitle>
                            <CardDescription>{quiz.questions.length} سوال</CardDescription>
                        </div>
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}

export default function StudentQuizzesPage() {
    const { firestore, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const quizzesQuery = useMemoFirebase(() => {
        if (!teacherId) return null;
        return query(collection(firestore, 'teachers', teacherId, 'quizzes'), orderBy('createdAt', 'desc'));
    }, [firestore, teacherId]);

    const { data: quizzes, isLoading } = useCollection<Quiz>(quizzesQuery);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <FileText className="h-7 w-7 text-primary" />
                        آزمون‌ها
                    </CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید در آزمون‌هایی که توسط معلم شما تعریف شده شرکت کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : (
                quizzes && quizzes.length > 0 ? (
                    <div className="space-y-4">
                        {quizzes.map(quiz => (
                            <QuizItem key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            هنوز هیچ آزمونی توسط معلم شما تعریف نشده است.
                        </CardContent>
                    </Card>
                )
            )}
        </div>
    );
}
