'use client';

import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizForm } from '@/components/teacher/QuizForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function EditQuizPage({ params }: { params: { id: string } }) {
    const { firestore, user } = useFirebase();
    const router = useRouter();
    const { id } = params;

    const quizRef = useMemoFirebase(() => {
        if (!user || !id) return null;
        return doc(firestore, 'teachers', user.uid, 'quizzes', id);
    }, [firestore, user, id]);

    const { data: quiz, isLoading } = useDoc<Quiz>(quizRef);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-4 rounded-md border p-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!quiz) {
        return notFound();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <FileText />
                    ویرایش آزمون
                </CardTitle>
                <CardDescription>
                    اطلاعات و سوالات آزمون «{quiz.title}» را ویرایش کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <QuizForm quiz={quiz} onSuccess={() => router.push('/teacher/quizzes')} />
            </CardContent>
        </Card>
    );
}

    