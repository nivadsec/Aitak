'use client';

import { Lightbulb, Sparkles } from 'lucide-react';
import { generateMotivationalTips } from '@/ai/flows/generate-motivational-tips';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

interface MotivationTipProps {
    reportTrends?: string;
    studentName?: string;
}

export function MotivationTip({ reportTrends, studentName = 'دانش‌آموز' }: MotivationTipProps) {
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTip = async () => {
    setIsLoading(true);
    setTip(null);
    setError(null);
    try {
      const result = await generateMotivationalTips({
        studentName: studentName,
        reportTrends: reportTrends || 'هیچ روند خاصی در گزارش‌های اخیر مشاهده نشده است.',
      });
      setTip(result.motivationalTips);
    } catch (error) {
      console.error('Failed to generate tip:', error);
      setError('متاسفانه در حال حاضر امکان ارائه نکته جدید وجود ندارد. لطفا بعدا تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Lightbulb className="h-6 w-6" />
            </div>
            <div className="flex-1">
                <CardTitle className="font-headline text-lg">نکته انگیزشی هوشمند</CardTitle>
                <CardDescription className="text-xs">
                    هوش مصنوعی آی‌تاب برای شما یک نکته شخصی‌سازی شده دارد
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-32 mt-4" />
            </div>
        )}
        {error && !isLoading && (
            <p className="text-sm text-destructive">{error}</p>
        )}
        {tip && !isLoading && (
             <p className="leading-relaxed text-sm text-foreground/90">{tip}</p>
        )}
        {!tip && !isLoading && !error && (
            <div className='flex flex-col items-start gap-4'>
                <p className="text-sm text-muted-foreground">برای دریافت یک نکته جدید از هوش مصنوعی بر اساس عملکرد اخیرتان، روی دکمه زیر کلیک کنید.</p>
                <Button onClick={handleGenerateTip} disabled={isLoading} size="sm">
                    <Sparkles className="ml-2 h-4 w-4" />
                    دریافت نکته جدید
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
