'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { FocusLadder } from '@/components/student/FocusLadder';
import { FocusIntervalsChart } from '@/components/teacher/FocusIntervalsChart';
import type { FocusInterval } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FocusAnalysis } from '@/components/student/FocusAnalysis';


export default function FocusPage() {
    const { firestore, user, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const focusIntervalsQuery = useMemoFirebase(() => {
        if (!user || !teacherId) return null;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return query(
            collection(firestore, 'teachers', teacherId, 'students', user.uid, 'focusIntervals'),
            where('timestamp', '>=', oneWeekAgo),
            orderBy('timestamp', 'desc')
        );
    }, [firestore, user, teacherId]);

    const { data: focusIntervals, isLoading: areIntervalsLoading } = useCollection<FocusInterval>(focusIntervalsQuery);

    return (
        <div className="space-y-8">
             <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <BrainCircuit className="h-7 w-7 text-primary" />
                        نردبان و نمودار تمرکز
                    </CardTitle>
                    <CardDescription>
                        در پایان هر بازه مطالعه، میزان تمرکز خود را ثبت کرده و روند آن را در نمودار هفتگی مشاهده کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            <FocusLadder />

            {areIntervalsLoading ? (
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-80" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[250px] w-full" />
                    </CardContent>
                </Card>
            ) : (
                <>
                    <FocusIntervalsChart intervals={focusIntervals || []} />
                    <FocusAnalysis intervals={focusIntervals || []} studentId={user?.uid || ''} />
                </>
            )}
        </div>
    );
}
