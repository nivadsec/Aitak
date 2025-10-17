'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Questionnaire } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, PlusCircle } from 'lucide-react';
import { QuestionnairesList } from '@/components/teacher/QuestionnairesList';
import Link from 'next/link';

export default function TeacherQuestionnairesPage() {
    const { firestore, user } = useFirebase();

    const questionnairesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'questionnaires'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: questionnaires, isLoading } = useCollection<Questionnaire>(questionnairesQuery);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <FileText />
                            مدیریت پرسشنامه‌ها
                        </CardTitle>
                        <CardDescription>
                            پرسشنامه‌های جدید (مانند آزمون هوش، شخصیت‌شناسی و...) ایجاد کنید، موارد قبلی را ویرایش یا حذف کنید و نتایج را مشاهده نمایید.
                        </CardDescription>
                    </div>
                     <Button asChild>
                        <Link href="/teacher/questionnaires/new">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            پرسشنامه جدید
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
                        <QuestionnairesList questionnaires={questionnaires || []} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
