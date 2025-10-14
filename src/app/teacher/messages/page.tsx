'use client';

import { MessageForm } from '@/components/teacher/MessageForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherMessagesPage() {
    const { firestore, user } = useFirebase();

    const studentsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'students'));
    }, [firestore, user]);

    const { data: students, isLoading } = useCollection(studentsQuery);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">ارسال پیام جدید</CardTitle>
                    <CardDescription>
                        به یک دانش‌آموز خاص یا همه دانش‌آموزان خود پیام ارسال کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    ) : (
                        <MessageForm students={students || []} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
