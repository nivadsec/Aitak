'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, Smartphone, Smile, Users, TrendingUp, BookOpen, BarChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

interface AnalyticsDashboardProps {
    isLoading: boolean;
    studentCount: number;
    analyticsData: {
        weeklyStudyData: { day: string; hours: number }[];
        subjectDistributionData: { name: string; value: number }[];
        overallStats: {
            avgDailyStudyHours: string;
            avgDailyMobileHours: string;
            avgMood: string;
        };
    } | null;
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Skeleton className="h-[350px] w-full" />
                <Skeleton className="h-[350px] w-full" />
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[350px]">
            <BarChart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">داده کافی برای نمایش نمودار وجود ندارد</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                پس از ثبت اولین گزارش توسط دانش‌آموزان، نمودارها در اینجا نمایش داده خواهند شد.
            </p>
        </div>
    )
}

export function AnalyticsDashboard({ isLoading, studentCount, analyticsData }: AnalyticsDashboardProps) {

    if (isLoading) {
        return <LoadingSkeleton />
    }
    
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">کل دانش‌آموزان</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentCount}</div>
                        <p className="text-xs text-muted-foreground">دانش‌آموز فعال در سیستم</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">میانگین مطالعه (روزانه)</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData?.overallStats.avgDailyStudyHours || '0'} ساعت</div>
                        <p className="text-xs text-muted-foreground">میانگین کل دانش‌آموزان</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">استفاده از موبایل</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData?.overallStats.avgDailyMobileHours || '0'} ساعت</div>
                        <p className="text-xs text-muted-foreground">میانگین کل دانش‌آموزان</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">میانگین رضایت (از ۱۰)</CardTitle>
                        <Smile className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData?.overallStats.avgMood || '0'}</div>
                        <p className="text-xs text-muted-foreground">میانگین کل دانش‌آموزان</p>
                    </CardContent>
                </Card>
            </div>
    
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            روند مطالعه هفتگی
                        </CardTitle>
                        <CardDescription>میانگین ساعت مطالعه کل دانش‌آموزان در هفته گذشته</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analyticsData && analyticsData.weeklyStudyData.length > 0 ? (
                            <ChartContainer config={{}} className="h-[250px] w-full">
                                <LineChart data={analyticsData.weeklyStudyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day"
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        axisLine={{ stroke: 'hsl(var(--border))' }}
                                        tickLine={false} />
                                    <YAxis
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        axisLine={{ stroke: 'hsl(var(--border))' }}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value} س`}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} />
                                </LineChart>
                            </ChartContainer>
                        ) : <EmptyState />}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            تقسیم زمان بین دروس
                        </CardTitle>
                        <CardDescription>درصد زمان مطالعه صرف شده برای هر درس</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {analyticsData && analyticsData.subjectDistributionData.length > 0 ? (
                            <ChartContainer config={{}} className="h-[250px] w-full">
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={analyticsData.subjectDistributionData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        innerRadius={60}
                                        paddingAngle={2}
                                        labelLine={false}
                                    >
                                        {analyticsData.subjectDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        content={({ payload }) => {
                                            return (
                                                <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs text-muted-foreground">
                                                {payload?.map((entry, index) => (
                                                    <li key={`item-${index}`} className="flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    {entry.value}
                                                    </li>
                                                ))}
                                                </ul>
                                            )
                                        }}
                                    />
                                </PieChart>
                            </ChartContainer>
                         ) : <EmptyState />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
