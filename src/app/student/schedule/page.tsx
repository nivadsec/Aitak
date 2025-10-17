'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Link as LinkIcon } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { ScheduleItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { isPast, isToday } from 'date-fns';

function ScheduleItemCard({ item }: { item: ScheduleItem }) {
    const itemDate = new Date(item.dateTime.seconds * 1000);
    const isItemPast = isPast(itemDate);
    const isItemToday = isToday(itemDate);

    return (
        <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-border -mb-2" />
                <div className={`w-3 h-3 rounded-full ${isItemPast ? 'bg-muted' : isItemToday ? 'bg-primary animate-pulse' : 'bg-primary/50'}`} />
                <div className="w-px flex-1 bg-border" />
            </div>
            <div className="pb-8 flex-1">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-sm font-semibold ${isItemPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                           {itemDate.toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })} - ساعت {itemDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <h4 className={`font-headline text-lg ${isItemPast ? 'text-muted-foreground' : 'text-primary'}`}>{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                     <div>
                        {isItemToday && <Badge>امروز</Badge>}
                        {isItemPast && <Badge variant="outline">برگزار شد</Badge>}
                    </div>
                 </div>

                {item.link && !isItemPast && (
                    <Button asChild size="sm" className="mt-3">
                        <Link href={item.link} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="ml-2 h-4 w-4" />
                            ورود به کلاس/جلسه
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function StudentSchedulePage() {
    const { firestore, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const scheduleQuery = useMemoFirebase(() => {
        if (!teacherId) return null;
        return query(collection(firestore, 'teachers', teacherId, 'schedule'), orderBy('dateTime', 'asc'));
    }, [firestore, teacherId]);

    const { data: scheduleItems, isLoading } = useCollection<ScheduleItem>(scheduleQuery);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <Calendar className="h-7 w-7 text-primary" />
                        برنامه کلاسی و جلسات
                    </CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید برنامه‌های کلاسی و جلسات مشاوره خود را مشاهده کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">برنامه‌های آینده</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-8">
                             <div className="flex gap-4"><Skeleton className="w-3 h-3 rounded-full mt-7" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /></div></div>
                             <div className="flex gap-4"><Skeleton className="w-3 h-3 rounded-full mt-7" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /></div></div>
                         </div>
                    ): (
                        scheduleItems && scheduleItems.length > 0 ? (
                            <div className="relative">
                                {scheduleItems.map((item, index) => (
                                    <ScheduleItemCard key={index} item={item} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                هنوز هیچ برنامه کلاسی یا جلسه‌ای توسط معلم شما ثبت نشده است.
                            </p>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
