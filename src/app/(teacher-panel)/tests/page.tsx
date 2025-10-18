
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Test } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, PlusCircle } from 'lucide-react';
import { TestsList } from '@/components/teacher/TestsList';
import Link from 'next/link';

export default function TeacherTestsPage() {
    const { firestore, user } = useFirebase();

    const testsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'tests'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: tests, isLoading } = useCollection<Test>(testsQuery);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <ClipboardList />
                            مدیریت آزمون‌های آنلاین
                        </CardTitle>
                        <CardDescription>
                            آزمون‌های درسی جدید ایجاد کنید، موارد قبلی را ویرایش یا حذف کنید و نتایج را مشاهده نمایید.
                        </CardDescription>
                    </div>
                     <Button asChild>
                        <Link href="/teacher/tests/new">
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
                        <TestsList tests={tests || []} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
