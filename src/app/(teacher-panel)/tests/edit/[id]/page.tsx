
'use client';

import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Test } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { TestForm } from '@/components/teacher/TestForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function EditTestPage({ params }: { params: { id: string } }) {
    const { firestore, user } = useFirebase();
    const router = useRouter();
    const { id } = params;

    const testRef = useMemoFirebase(() => {
        if (!user || !id) return null;
        return doc(firestore, 'teachers', user.uid, 'tests', id);
    }, [firestore, user, id]);

    const { data: test, isLoading } = useDoc<Test>(testRef);

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
    
    if (!test) {
        return notFound();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <ClipboardList />
                    ویرایش آزمون آنلاین
                </CardTitle>
                <CardDescription>
                    اطلاعات و سوالات آزمون «{test.title}» را ویرایش کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TestForm test={test} onSuccess={() => router.push('/teacher/tests')} />
            </CardContent>
        </Card>
    );
}
