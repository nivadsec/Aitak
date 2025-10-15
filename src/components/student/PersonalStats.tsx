'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BrainCircuit, CheckCircle2, Smile, Smartphone, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { StudentReport } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

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

const CHART_COLORS = {
  correct: 'hsl(var(--chart-1))', // Firoozei
  wrong: 'hsl(var(--chart-2))', // Silver
  unanswered: 'hsl(var(--muted))', // Gray
};

function TestAnalyticsChart({ report }: { report: StudentReport }) {
  const testData = React.useMemo(() => {
    if (!report || !report.items || report.items.length === 0) {
      return null;
    }

    const correct = report.items.reduce((sum, item) => sum + (item.correctCount || 0), 0);
    const wrong = report.items.reduce((sum, item) => sum + (item.wrongCount || 0), 0);
    const totalQuestions = report.items.reduce((sum, item) => sum + (item.testCount || 0), 0);
    
    if (totalQuestions === 0) return null;
    
    const unanswered = totalQuestions - (correct + wrong);

    const chartData = [
      { name: 'صحیح', value: correct, color: CHART_COLORS.correct },
      { name: 'غلط', value: wrong, color: CHART_COLORS.wrong },
      { name: 'نزده', value: unanswered, color: CHART_COLORS.unanswered },
    ].filter(item => item.value > 0);

    const accuracyPercent = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
    const accuracyRate = (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0;
    const responseCoverage = totalQuestions > 0 ? ((correct + wrong) / totalQuestions) * 100 : 0;

    return {
      chartData,
      totalQuestions,
      accuracyPercent: accuracyPercent.toFixed(1),
      accuracyRate: accuracyRate.toFixed(1),
      responseCoverage: responseCoverage.toFixed(1),
    };
  }, [report]);

  if (!testData) {
    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    تحلیل تست‌ها
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground text-sm flex items-center justify-center h-48">
                داده‌ای برای نمایش نمودار در این گزارش وجود ندارد.
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg shadow-primary/5 bg-card">
        <CardHeader>
             <CardTitle className="font-headline text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                تحلیل تست‌های گزارش اخیر
            </CardTitle>
             <CardDescription>
                توزیع پاسخ‌ها و شاخص‌های عملکردی شما
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 <div className="h-48 w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={testData.chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                innerRadius={50}
                                dataKey="value"
                                stroke="hsl(var(--background))"
                                strokeWidth={3}
                            >
                                {testData.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    fontFamily: 'Vazirmatn, sans-serif',
                                    borderRadius: '0.5rem',
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                }}
                                cursor={{ fill: 'hsl(var(--background))' }}
                            />
                            <Legend
                                iconType="circle"
                                formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                                wrapperStyle={{ fontSize: '0.8rem', direction: 'rtl' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-baseline p-3 bg-primary/10 rounded-lg">
                        <span className="text-sm font-medium text-foreground/90">درصد کل شما:</span>
                        <span className="text-2xl font-bold font-headline text-primary">{testData.accuracyPercent}%</span>
                    </div>
                     <div className="text-sm space-y-2 text-muted-foreground">
                        <p><strong>نرخ دقت (خالص):</strong> {testData.accuracyRate}%</p>
                        <p><strong>پوشش پاسخگویی:</strong> {testData.responseCoverage}%</p>
                         <p><strong>مجموع سوالات:</strong> {testData.totalQuestions} سوال</p>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  )
}


export default function PersonalStats({ children, report, isLoading }: { children?: React.ReactNode, report: StudentReport | undefined, isLoading: boolean }) {
  const stats = React.useMemo(() => {
    if (!report) return null;
    const totalStudyMinutes = report.items ? report.items.reduce((sum, item) => sum + (item.studyTime || 0), 0) : 0;
    const avgStudyHours = (totalStudyMinutes / 60).toFixed(1);
    
    const totalCorrect = report.items ? report.items.reduce((sum, item) => sum + (item.correctCount || 0), 0) : 0;
    const totalTests = report.items ? report.items.reduce((sum, item) => sum + (item.testCount || 0), 0) : 0;
    const accuracy = totalTests > 0 ? ((totalCorrect / totalTests) * 100).toFixed(0) : 0;

    return {
      avgStudyHours,
      moodScore: report.moodScore,
      mobileHours: report.mobileHours,
      accuracy,
    }
  }, [report]);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                 <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                 <CardContent>
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!report || !stats) {
      return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                        آمار آخرین گزارش
                    </CardTitle>
                    <CardDescription>برای مشاهده آمار، ابتدا یک گزارش ثبت کنید.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    هنوز گزارشی ثبت نشده است.
                </CardContent>
            </Card>
            {children}
        </div>
      )
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            آمار آخرین گزارش
          </CardTitle>
          <CardDescription>خلاصه عملکرد شما در آخرین گزارش ثبت‌شده</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    icon={BrainCircuit}
                    title="مجموع مطالعه"
                    value={`${stats.avgStudyHours} ساعت`}
                    footer="در آخرین گزارش"
                    colorClass="text-primary"
                />
                <StatCard 
                    icon={CheckCircle2}
                    title="دقت تست"
                    value={`${stats.accuracy}%`}
                    footer="در کل تست‌ها"
                    colorClass="text-green-500"
                />
                 <StatCard 
                    icon={Smile}
                    title="شاخص روانی"
                    value={`${stats.moodScore}`}
                    footer="امتیاز از ۱۰"
                    colorClass="text-amber-500"
                />
                 <StatCard 
                    icon={Smartphone}
                    title="استفاده از موبایل"
                    value={`${stats.mobileHours} ساعت`}
                    footer="در آخرین گزارش"
                    colorClass="text-red-500"
                />
            </div>
        </CardContent>
      </Card>
       {report && <TestAnalyticsChart report={report} />}
      {children}
    </div>
  );
}
