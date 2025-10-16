'use client';

import { analyzeFocusIntervals } from '@/ai/flows/analyze-focus-intervals';
import type { FocusInterval } from '@/lib/types';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, BrainCircuit, Loader2, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type AnalyzeFocusIntervalsInput = {
    studentId: string;
    intervals: {
        intervalName: string;
        score: number;
        timestamp: string;
    }[];
}

type AnalyzeFocusIntervalsOutput = {
    focusSummary: string;
    positivePatterns: string[];
    negativePatterns: string[];
    recommendations: string[];
}

interface FocusAnalysisProps {
    intervals: FocusInterval[];
    studentId: string;
}

export function FocusAnalysis({ intervals, studentId }: FocusAnalysisProps) {
    const [analysis, setAnalysis] = useState<AnalyzeFocusIntervalsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (intervals.length === 0) {
            setError("ابتدا باید حداقل یک بازه تمرکز ثبت کنید تا تحلیلی ارائه شود.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const inputForAI: AnalyzeFocusIntervalsInput = {
                studentId: studentId,
                intervals: intervals.map(i => ({
                    intervalName: i.intervalName,
                    score: i.score,
                    timestamp: new Date(i.timestamp.seconds * 1000).toLocaleString('fa-IR'),
                })),
            };
            const result = await analyzeFocusIntervals(inputForAI);
            setAnalysis(result);
        } catch (err) {
            console.error("Focus analysis error:", err);
            setError("متاسفانه در حال حاضر امکان تحلیل داده‌ها وجود ندارد. لطفا کمی بعد دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    تحلیل هوشمند تمرکز
                </CardTitle>
                <CardDescription>
                    از هوش مصنوعی بخواهید تا الگوهای تمرکز شما را تحلیل کرده و پیشنهادهایی برای بهبود آن ارائه دهد.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!analysis && !isLoading && (
                    <div className="flex flex-col items-start gap-4">
                        <p className="text-sm text-muted-foreground">
                            برای دریافت گزارش تحلیلی از عملکرد تمرکز خود در بازه‌های ثبت‌شده، روی دکمه زیر کلیک کنید.
                        </p>
                        <Button onClick={handleAnalyze} disabled={intervals.length === 0}>
                            <Sparkles className="ml-2 h-4 w-4" />
                            شروع تحلیل هوشمند
                        </Button>
                         {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                )}

                {isLoading && (
                     <div className="space-y-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>در حال پردازش داده‌ها و آماده‌سازی گزارش...</span>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Skeleton className="h-24 w-full" />
                             <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                )}

                {analysis && !isLoading && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <h3 className="font-headline text-base mb-2">خلاصه وضعیت تمرکز</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.focusSummary}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <h3 className="font-headline text-base mb-2 flex items-center gap-2 text-green-600">
                                    <ThumbsUp className="h-5 w-5" />
                                    الگوهای مثبت
                                </h3>
                                <ul className="space-y-2 pr-1 text-sm">
                                {analysis.positivePatterns.map((pattern, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <div className="flex-shrink-0 pt-1">
                                            <ThumbsUp className="h-4 w-4 text-green-500" />
                                        </div>
                                        <span>{pattern}</span>
                                    </li>
                                ))}
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-headline text-base mb-2 flex items-center gap-2 text-destructive">
                                    <ThumbsDown className="h-5 w-5" />
                                    الگوهای نگران‌کننده
                                </h3>
                                <ul className="space-y-2 pr-1 text-sm">
                                {analysis.negativePatterns.map((pattern, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                         <div className="flex-shrink-0 pt-1">
                                            <ThumbsDown className="h-4 w-4 text-red-500" />
                                        </div>
                                        <span>{pattern}</span>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-headline text-base mb-2 flex items-center gap-2 text-primary">
                                <Sparkles className="h-5 w-5" />
                                پیشنهادهای هوشمند
                            </h3>
                            <ul className="space-y-3 pr-1 text-sm text-muted-foreground">
                            {analysis.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 pt-1">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>{rec}</span>
                                </li>
                            ))}
                            </ul>
                        </div>
                        <Button variant="outline" onClick={() => setAnalysis(null)}>
                            تحلیل مجدد
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
