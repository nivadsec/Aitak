'use client';

import { analyzeStudentPerformance } from '@/ai/flows/analyze-student-performance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, MessageSquareWarning, Sparkles } from 'lucide-react';
import type { AnalyzeStudentPerformanceInput } from '@/ai/flows/analyze-student-performance';
import { useEffect, useState } from 'react';
import type { AnalyzeStudentPerformanceOutput } from '@/ai/flows/analyze-student-performance';
import { Skeleton } from '../ui/skeleton';

type StudentPerformanceAnalysisProps = AnalyzeStudentPerformanceInput;

export default function StudentPerformanceAnalysis({ studentId, dailyReports }: StudentPerformanceAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalyzeStudentPerformanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      if (!dailyReports || dailyReports.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await analyzeStudentPerformance({ studentId, dailyReports });
        setAnalysis(result);
      } catch (error) {
        console.error("Error fetching student performance analysis:", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalysis();
  }, [studentId, dailyReports]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-xl">تحلیل عملکرد هوشمند</CardTitle>
          </div>
          <CardDescription>
            در حال پردازش داده‌ها توسط هوش مصنوعی...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">تحلیل عملکرد هوشمند</CardTitle>
        </CardHeader>
        <CardContent>
          <p>هنوز گزارشی برای این دانش‌آموز ثبت نشده تا تحلیلی ارائه شود.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-xl">تحلیل عملکرد هوشمند</CardTitle>
        </div>
        <CardDescription>
          خلاصه، هشدارها و پیشنهادهای تولید شده توسط هوش مصنوعی
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-headline text-lg mb-2">خلاصه عملکرد</h3>
          <p className="text-muted-foreground leading-relaxed">{analysis.performanceSummary}</p>
        </div>

        {analysis.alerts && analysis.alerts.length > 0 && (
          <div>
            <h3 className="font-headline text-lg mb-2 flex items-center gap-2">
                <MessageSquareWarning className='h-5 w-5 text-destructive' />
                هشدارها
            </h3>
            <div className="flex flex-col gap-2">
              {analysis.alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <div className="flex-shrink-0 pt-0.5">
                    <MessageSquareWarning className="h-5 w-5 text-destructive" />
                  </div>
                  <p className="text-sm text-destructive-foreground leading-relaxed">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
             <h3 className="font-headline text-lg mb-2 flex items-center gap-2">
                <Sparkles className='h-5 w-5 text-primary' />
                پیشنهادها
            </h3>
            <ul className="space-y-3 pr-1">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">
                        <Sparkles className='h-4 w-4 text-primary' />
                    </div>
                    <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {analysis.incentiveRecommendation && (
             <div>
             <h3 className="font-headline text-lg mb-2 flex items-center gap-2">
                پیشنهاد انگیزشی
            </h3>
            <p className="text-muted-foreground leading-relaxed">{analysis.incentiveRecommendation}</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
