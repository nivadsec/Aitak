
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { StrategicPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function PlanItem({ plan }: { plan: StrategicPlan }) {
    return (
        <Card className="hover:border-primary/50 hover:bg-muted/50 transition-all">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle className="font-headline text-lg">{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                    </div>
                     {plan.fileUrl && (
                        <Button asChild variant="outline" size="icon">
                            <Link href={plan.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
             <CardContent>
                <p className="text-xs text-muted-foreground">
                    تاریخ انتشار: {new Date(plan.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
                </p>
            </CardContent>
        </Card>
    );
}

export default function StudentStrategicPlansPage() {
    const { firestore, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const plansQuery = useMemoFirebase(() => {
        if (!teacherId) return null;
        return query(collection(firestore, 'teachers', teacherId, 'strategicPlans'), orderBy('createdAt', 'desc'));
    }, [firestore, teacherId]);

    const { data: plans, isLoading } = useCollection<StrategicPlan>(plansQuery);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <Map className="h-7 w-7 text-primary" />
                        برنامه‌های راهبردی
                    </CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید برنامه‌های راهبردی آزمون‌ها که توسط معلم شما بارگذاری شده را مشاهده و دانلود کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : (
                plans && plans.length > 0 ? (
                    <div className="space-y-4">
                        {plans.map(plan => (
                            <PlanItem key={plan.id} plan={plan} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="font-semibold">هیچ برنامه راهبردی یافت نشد</h3>
                            <p className="text-sm mt-1">هنوز هیچ برنامه‌ای توسط معلم شما بارگذاری نشده است.</p>
                        </CardContent>
                    </Card>
                )
            )}
        </div>
    );
}
