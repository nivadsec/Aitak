'use client';

import React from 'react';
import type { DailyReport } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Clock, Smile, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

function processReportsForStats(reports: DailyReport[]) {
    if (!reports || reports.length === 0) {
        return null;
    }

    const totalReports = reports.length;
    const totalStudyMinutes = reports.reduce((sum, r) => sum + (r.totalStudyMinutes || 0), 0);
    const totalMoodScore = reports.reduce((sum, r) => sum + r.disasterLevel, 0);

    const avgStudyHours = totalReports > 0 ? (totalStudyMinutes / 60) / totalReports : 0;
    const avgMood = totalReports > 0 ? totalMoodScore / totalReports : 0;

    const totalTests = reports.reduce((sum, r) => sum + (r.items || []).reduce((iSum, i) => iSum + i.totalTestQuestions, 0), 0);
    const totalCorrect = reports.reduce((sum, r) => sum + (r.items || []).reduce((iSum, i) => iSum + i.correctTestQuestions, 0), 0);
    const totalWrong = reports.reduce((sum, r) => sum + (r.items || []).reduce((iSum, i) => iSum + i.incorrectTestQuestions, 0), 0);
    const overallAccuracy = totalTests > 0 ? (((totalCorrect * 3) - totalWrong) / (totalTests * 3)) * 100 : 0;

    return {
        avgStudyHours: avgStudyHours.toFixed(1),
        avgMood: avgMood.toFixed(1),
        overallAccuracy: overallAccuracy.toFixed(1),
    };
}


export function DashboardStatsCard({ reports }: { reports: DailyReport[] }) {
    const stats = React.useMemo(() => processReportsForStats(reports), [reports]);

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-xl">آمار عملکرد کلی</CardTitle>
                </div>
                <CardDescription>
                    نگاهی سریع به میانگین‌های شما بر اساس گزارش‌های اخیر.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                {stats ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="flex flex-col items-center justify-center space-y-1 rounded-lg bg-muted/50 p-3">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" /> مطالعه</dt>
                            <dd className="text-2xl font-bold text-primary">{stats.avgStudyHours}</dd>
                            <dd className="text-xs text-muted-foreground">ساعت/روز</dd>
                        </div>
                         <div className="flex flex-col items-center justify-center space-y-1 rounded-lg bg-muted/50 p-3">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> تست</dt>
                            <dd className="text-2xl font-bold text-green-600">{stats.overallAccuracy}%</dd>
                             <dd className="text-xs text-muted-foreground">درصد کل</dd>
                        </div>
                         <div className="flex flex-col items-center justify-center space-y-1 rounded-lg bg-muted/50 p-3">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Smile className="h-4 w-4" /> روانی</dt>
                            <dd className="text-2xl font-bold text-amber-600">{stats.avgMood}</dd>
                             <dd className="text-xs text-muted-foreground">از ۱۰</dd>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center pt-8">
                        هنوز گزارشی برای نمایش آمار ثبت نشده است.
                    </p>
                )}
            </CardContent>
            <CardContent>
                 <Button asChild className="w-full">
                    <Link href="/student/stats">
                        <TrendingUp className="ml-2 h-4 w-4" />
                        مشاهده تحلیل کامل
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
