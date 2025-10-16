'use client';

import { MessageForm } from '@/components/teacher/MessageForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

export default function TeacherMessagesPage() {
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
                        <MessageSquare className="h-7 w-7 text-primary" />
                        ارسال پیام
                    </CardTitle>
                    <CardDescription>
                        به یک دانش‌آموز خاص یا همه دانش‌آموزان خود پیام متنی ارسال کنید.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">ارسال پیام جدید</CardTitle>
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
