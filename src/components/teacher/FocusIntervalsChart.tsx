'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from "date-fns-jalali";
import { BrainCircuit, TrendingUp } from 'lucide-react';
import type { FocusInterval } from '@/lib/types';


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

interface FocusIntervalsChartProps {
    intervals: FocusInterval[];
}

export function FocusIntervalsChart({ intervals }: FocusIntervalsChartProps) {
    const focusData = React.useMemo(() => processFocusIntervals(intervals), [intervals]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-lg">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    نمودار تمرکز دانش‌آموز (۷ روز اخیر)
                </CardTitle>
                <CardDescription>روند امتیاز تمرکز ثبت شده توسط دانش‌آموز</CardDescription>
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
                                labelStyle={{ direction: 'ltr' }}
                            />
                             <Legend wrapperStyle={{fontSize: '12px'}} />
                            <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} name="امتیاز تمرکز" />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>هنوز بازه تمرکزی توسط دانش‌آموز برای نمایش نمودار ثبت نشده است.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
