'use client'

import React from "react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, limit, query, orderBy, where } from "firebase/firestore";
import type { FocusInterval } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from "date-fns-jalali";
import { FocusLadder } from "@/components/student/FocusLadder";

function processFocusIntervals(intervals: FocusInterval[]) {
    if (!intervals || intervals.length === 0) {
        return [];
    }

    return intervals
        .map(interval => ({
            ...interval,
            time: format(new Date(interval.timestamp.seconds * 1000), 'MM/dd HH:mm'),
        }))
        .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
}


export default function StudentFocusPage() {
    const { firestore, user, role } = useFirebase();
    const teacherId = role?.split(':')[1];

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

    const { data: focusIntervals, isLoading: areIntervalsLoading } = useCollection<FocusInterval>(focusIntervalsQuery);
    
    const focusData = React.useMemo(() => processFocusIntervals(focusIntervals || []), [focusIntervals]);
    
    if (areIntervalsLoading) {
        return (
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                </Card>
                 <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[350px] w-full" />
                    <Skeleton className="h-[350px] w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <BrainCircuit className="h-7 w-7 text-primary" />
                        نردبان تمرکز
                    </CardTitle>
                    <CardDescription>
                        در پایان هر بازه مطالعه، میزان تمرکزت را ثبت و روند آن را مشاهده کن.
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
                                روند تمرکز (۲۴ ساعت گذشته)
                            </CardTitle>
                            <CardDescription>نمودار امتیاز تمرکز شما در بازه‌های مطالعه ثبت شده</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {focusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={295}>
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
                                <div className="text-center text-muted-foreground py-10 h-[295px] flex flex-col justify-center items-center">
                                    <p>هنوز بازه تمرکزی برای نمایش نمودار ثبت نشده است.</p>
                                    <p className="text-sm mt-2">از فرم کنار صفحه برای ثبت امتیاز استفاده کنید.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
