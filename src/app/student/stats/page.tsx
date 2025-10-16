'use client'

import React from "react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, limit, query, orderBy, where } from "firebase/firestore";
import type { FocusInterval, StudentReport } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Clock, Smartphone, Smile, TrendingUp, BookOpen, CheckCircle2, BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { format } from "date-fns-jalali";
import { FocusLadder } from "@/components/student/FocusLadder";


const StatCard = ({ icon: Icon, title, value, footer, colorClass }) => (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{footer}</p>
      </CardContent>
    </Card>
);

function processReportsForStats(reports: StudentReport[]) {
    if (!reports || reports.length === 0) {
        return null;
    }

    const totalReports = reports.length;

    // Overall stats
    const totalStudyMinutes = reports.reduce((sum, r) => sum + (r.items || []).reduce((iSum, i) => iSum + i.studyTime, 0), 0);
    const totalMoodScore = reports.reduce((sum, r) => sum + r.moodScore, 0);
    const totalMobileHours = reports.reduce((sum, r) => sum + r.mobileHours, 0);

    const avgStudyHours = totalReports > 0 ? (totalStudyMinutes / 60) / totalReports : 0;
    const avgMood = totalReports > 0 ? totalMoodScore / totalReports : 0;
    const avgMobileHours = totalReports > 0 ? totalMobileHours / totalReports : 0;

    // Test stats
    const totalTests = reports.reduce((sum, r) => sum + (r.items || []).reduce((iSum, i) => iSum + i.testCount, 0), 0);
    const totalCorrect = reports.reduce((sum, r) => sum + (r.items || []).reduce((iSum, i) => iSum + i.correctCount, 0), 0);
    const totalWrong = reports.reduce((sum, r) => sum + (r.items || []).reduce((iSum, i) => iSum + i.wrongCount, 0), 0);
    const overallAccuracy = totalTests > 0 ? (((totalCorrect * 3) - totalWrong) / (totalTests * 3)) * 100 : 0;

    // Trend data (last 7 reports)
    const trendReports = reports.slice(0, 7).reverse(); // Oldest to newest
    const studyTrendData = trendReports.map(r => ({
        date: format(new Date(r.date), 'MM/dd'),
        'ساعت مطالعه': parseFloat(((r.items || []).reduce((sum, i) => sum + i.studyTime, 0) / 60).toFixed(1)),
        'نمره روانی': r.moodScore,
    }));
    
    // Subject distribution
    const subjectDistribution = new Map<string, number>();
    reports.forEach(r => {
        (r.items || []).forEach(item => {
            const currentMinutes = subjectDistribution.get(item.subject) || 0;
            subjectDistribution.set(item.subject, currentMinutes + item.studyTime);
        });
    });
    const subjectDistributionData = Array.from(subjectDistribution.entries())
        .map(([name, value]) => ({ name, 'زمان (ساعت)': parseFloat((value / 60).toFixed(1)) }))
        .sort((a, b) => b['زمان (ساعت)'] - a['زمان (ساعت)']);


    return {
        overallStats: {
            avgStudyHours: avgStudyHours.toFixed(1),
            avgMood: avgMood.toFixed(1),
            avgMobileHours: avgMobileHours.toFixed(1),
            overallAccuracy: overallAccuracy.toFixed(1),
        },
        studyTrendData,
        subjectDistributionData,
    };
}

function processFocusIntervals(intervals: FocusInterval[]) {
    if (!intervals || intervals.length === 0) {
        return [];
    }

    return intervals
        .map(interval => ({
            ...interval,
            time: format(new Date(interval.timestamp.seconds * 1000), 'HH:mm'),
        }))
        .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
}


export default function StudentStatsPage() {
    const { firestore, user, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const reportsQuery = useMemoFirebase(() => {
        if (!user || !firestore || !teacherId) return null;
        return query(
            collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports'),
            orderBy('date', 'desc'),
            limit(30) // Fetch last 30 reports for stats
        );
    }, [firestore, user, teacherId]);

    const focusIntervalsQuery = useMemoFirebase(() => {
        if (!user || !firestore || !teacherId) return null;
        // Fetch intervals from the last 24 hours for simplicity
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return query(
            collection(firestore, 'teachers', teacherId, 'students', user.uid, 'focusIntervals'),
            where('timestamp', '>=', yesterday),
            orderBy('timestamp', 'asc')
        );
    }, [firestore, user, teacherId]);

    const { data: reports, isLoading: areReportsLoading } = useCollection<StudentReport>(reportsQuery);
    const { data: focusIntervals, isLoading: areIntervalsLoading } = useCollection<FocusInterval>(focusIntervalsQuery);
    
    const statsData = React.useMemo(() => processReportsForStats(reports || []), [reports]);
    const focusData = React.useMemo(() => processFocusIntervals(focusIntervals || []), [focusIntervals]);
    
    const isLoading = areReportsLoading || areIntervalsLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                </Card>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[350px] w-full" />
                    <Skeleton className="h-[350px] w-full" />
                </div>
                 <div className="grid gap-6 md:grid-cols-1">
                    <Skeleton className="h-[350px] w-full" />
                </div>
            </div>
        )
    }

    if (!statsData && focusData.length === 0) {
        return (
             <div className="space-y-6">
                <Card className="bg-muted/30 border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3">
                            <BarChart className="h-7 w-7 text-primary" />
                            آمار و تمرکز
                        </CardTitle>
                        <CardDescription>
                            تحلیل جامع عملکرد و روند تمرکز شما بر اساس گزارش‌های ثبت‌شده.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <FocusLadder />
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <BarChart className="h-6 w-6 text-primary" />
                            آمار عملکرد فردی
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground py-16">
                        <p>هنوز گزارشی برای نمایش آمار ثبت نشده است.</p>
                        <p className="text-sm mt-2">پس از ثبت اولین گزارش روزانه، آمارهای شما در این صفحه نمایش داده خواهد شد.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <BarChart className="h-7 w-7 text-primary" />
                        آمار و تمرکز
                    </CardTitle>
                    <CardDescription>
                        تحلیل جامع عملکرد و روند تمرکز شما بر اساس گزارش‌های ثبت‌شده.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <FocusLadder />
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg">
                                    <BrainCircuit className="h-5 w-5 text-primary" />
                                روند تمرکز
                            </CardTitle>
                            <CardDescription>نمودار امتیاز تمرکز شما در بازه‌های مطالعه ثبت شده در ۲۴ ساعت گذشته</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {focusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <RechartsLineChart data={focusData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ fontFamily: 'Vazirmatn, sans-serif' }}
                                            formatter={(value, name, props) => [`${value} از ۱۰`, `امتیاز (${props.payload.intervalName})`]}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} name="امتیاز تمرکز" />
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted-foreground py-10 h-[250px] flex flex-col justify-center items-center">
                                    <p>هنوز بازه تمرکزی برای نمایش نمودار ثبت نشده است.</p>
                                    <p className="text-sm mt-2">از ماژول "نردبان تمرکز" برای ثبت امتیاز استفاده کنید.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            
           {statsData && (
             <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Clock} title="میانگین مطالعه روزانه" value={`${statsData.overallStats.avgStudyHours} ساعت`} footer="در ۳۰ روز گذشته" colorClass="text-primary" />
                    <StatCard icon={CheckCircle2} title="میانگین درصد تست" value={`${statsData.overallStats.overallAccuracy}%`} footer="در کل تست‌ها" colorClass="text-green-500" />
                    <StatCard icon={Smile} title="میانگین شاخص روانی" value={statsData.overallStats.avgMood} footer="امتیاز از ۱۰" colorClass="text-amber-500" />
                    <StatCard icon={Smartphone} title="میانگین موبایل" value={`${statsData.overallStats.avgMobileHours} ساعت`} footer="در ۳۰ روز گذشته" colorClass="text-red-500" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                روند مطالعه و وضعیت روانی
                            </CardTitle>
                            <CardDescription>نمودار عملکرد شما در ۷ گزارش اخیر</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsLineChart data={statsData.studyTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} unit="س" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ fontFamily: 'Vazirmatn, sans-serif' }} />
                                    <Legend wrapperStyle={{fontSize: '12px'}} />
                                    <Line yAxisId="left" type="monotone" dataKey="ساعت مطالعه" stroke="hsl(var(--primary))" strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="نمره روانی" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                                </RechartsLineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg">
                                <BookOpen className="h-5 w-5 text-primary" />
                                توزیع زمان مطالعه بین دروس
                            </CardTitle>
                            <CardDescription>مجموع زمان مطالعه برای هر درس در ۳۰ گزارش اخیر</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsBarChart data={statsData.subjectDistributionData} layout="vertical" margin={{ right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" unit="س" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" width={80} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ fontFamily: 'Vazirmatn, sans-serif' }} cursor={{fill: 'hsl(var(--muted))'}} />
                                    <Bar dataKey="زمان (ساعت)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </>
           )}
        </div>
    )
}
