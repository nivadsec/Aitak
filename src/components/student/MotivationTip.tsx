'use client';

import { Lightbulb, Sparkles } from 'lucide-react';
import { generateMotivationalTips } from '@/ai/flows/generate-motivational-tips';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export function MotivationTip() {
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateTip = async () => {
    setIsLoading(true);
    setTip(null); // Clear previous tip
    try {
      const result = await generateMotivationalTips({
        studentName: 'دانش‌آموز',
        reportTrends: 'کاهش جزئی در ساعات مطالعه اما افزایش در درصد تست‌های صحیح.',
      });
      setTip(result.motivationalTips);
    } catch (error) {
      console.error('Failed to generate tip:', error);
      setTip('متاسفانه در حال حاضر امکان ارائه نکته جدید وجود ندارد. لطفا بعدا تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Lightbulb className="h-6 w-6" />
            </div>
        </div>
        <div className="flex-1">
          <CardTitle className="font-headline text-lg">نکته انگیزشی</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        )}
        {tip && !isLoading && (
             <p className="leading-relaxed">{tip}</p>
        )}
        {!tip && !isLoading && (
            <div className='flex flex-col items-start gap-4'>
                <p className="text-sm text-muted-foreground">برای دریافت یک نکته جدید از هوش مصنوعی، روی دکمه زیر کلیک کنید.</p>
                <Button onClick={handleGenerateTip} disabled={isLoading}>
                    <Sparkles className="ml-2 h-4 w-4" />
                    دریافت نکته جدید
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
