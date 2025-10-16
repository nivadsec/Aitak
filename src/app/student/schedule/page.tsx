'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const scheduleData = [
    { time: '۱۰:۰۰ - ۱۱:۳۰', title: 'کلاس ریاضی - حسابان', description: 'لینک کلاس در توضیحات قرار داده شده است' },
    { time: '۱۴:۰۰ - ۱۵:۰۰', title: 'جلسه مشاوره با آقای طاهری', description: 'بررسی گزارش هفتگی' },
    { time: '۱۷:۰۰ - ۱۸:۳۰', title: 'کلاس فیزیک - دینامیک', description: 'حل تمرین های فصل دوم' },
];

function ScheduleItem({ time, title, description }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-border -mb-2" />
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="w-px flex-1 bg-border" />
            </div>
            <div className="pb-8">
                <p className="text-sm text-muted-foreground">{time}</p>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

export default function StudentSchedulePage() {
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
                    <CardTitle className="font-headline text-lg">برنامه امروز</CardTitle>
                </CardHeader>
                <CardContent>
                    {scheduleData.length > 0 ? (
                        <div className="relative">
                            {scheduleData.map((item, index) => (
                                <ScheduleItem key={index} {...item} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            امروز برنامه‌ای برای شما ثبت نشده است.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
