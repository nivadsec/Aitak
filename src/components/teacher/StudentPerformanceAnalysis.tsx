import { analyzeStudentPerformance } from '@/ai/flows/analyze-student-performance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, MessageSquareWarning, Sparkles } from 'lucide-react';
import type { AnalyzeStudentPerformanceInput } from '@/ai/flows/analyze-student-performance';

type StudentPerformanceAnalysisProps = AnalyzeStudentPerformanceInput;

export default async function StudentPerformanceAnalysis({ studentId, dailyReports }: StudentPerformanceAnalysisProps) {
  if (!dailyReports || dailyReports.length === 0) {
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

  const analysis = await analyzeStudentPerformance({ studentId, dailyReports });

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
                <div key={index} className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <MessageSquareWarning className="h-5 w-5 flex-shrink-0 text-destructive mt-1" />
                  <p className="text-sm text-destructive">{alert}</p>
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
            <ul className="list-disc space-y-2 pr-5 text-muted-foreground">
              {analysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
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
