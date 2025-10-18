'use client';

import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { ScheduleItem } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ScheduleForm } from '../../ScheduleForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';


export default function EditScheduleItemPage({ params }: { params: { id: string } }) {
    const { firestore, user } = useFirebase();
    const router = useRouter();
    const { id } = params;

    const itemRef = useMemoFirebase(() => {
        if (!user || !id) return null;
        return doc(firestore, 'teachers', user.uid, 'schedule', id);
    }, [firestore, user, id]);

    const { data: item, isLoading } = useDoc<ScheduleItem>(itemRef);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (!item) {
        return notFound();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <Calendar />
                    ویرایش جلسه
                </CardTitle>
                <CardDescription>
                    اطلاعات جلسه «{item.title}» را ویرایش کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScheduleForm item={item} onSuccess={() => router.push('/teacher/schedule')} />
            </CardContent>
        </Card>
    );
}

    
