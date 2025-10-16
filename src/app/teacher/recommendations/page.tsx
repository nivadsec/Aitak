'use client';

import { RecommendationForm } from '@/components/teacher/RecommendationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

export default function TeacherRecommendationsPage() {
    const { firestore, user } = useFirebase();

    const studentsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'students'));
    }, [firestore, user]);

    const { data: students, isLoading } = useCollection(studentsQuery);

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <Lightbulb className="h-7 w-7 text-primary" />
                        ارسال توصیه هوشمند
                    </CardTitle>
                    <CardDescription>
                        یک توصیه متنی برای دانش‌آموز ارسال کنید. می‌توانید گزارش کار او را تا زمان مطالعه توصیه قفل کرده و یا یک آزمون کوتاه برای اطمینان از درک مطلب اضافه کنید.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">ارسال توصیه جدید</CardTitle>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    ) : (
                        <RecommendationForm students={students || []} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
