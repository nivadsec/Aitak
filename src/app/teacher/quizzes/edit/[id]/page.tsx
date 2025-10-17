'use client';

import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Questionnaire } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionnaireForm } from '@/components/teacher/QuestionnaireForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function EditQuestionnairePage({ params }: { params: { id: string } }) {
    const { firestore, user } = useFirebase();
    const router = useRouter();
    const { id } = params;

    const questionnaireRef = useMemoFirebase(() => {
        if (!user || !id) return null;
        return doc(firestore, 'teachers', user.uid, 'questionnaires', id);
    }, [firestore, user, id]);

    const { data: questionnaire, isLoading } = useDoc<Questionnaire>(questionnaireRef);

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
    
    if (!questionnaire) {
        return notFound();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <FileText />
                    ویرایش پرسشنامه
                </CardTitle>
                <CardDescription>
                    اطلاعات و سوالات پرسشنامه «{questionnaire.title}» را ویرایش کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <QuestionnaireForm questionnaire={questionnaire} onSuccess={() => router.push('/teacher/questionnaires')} />
            </CardContent>
        </Card>
    );
}
