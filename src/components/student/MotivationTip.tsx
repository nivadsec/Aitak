import { Lightbulb } from 'lucide-react';
import { generateMotivationalTips } from '@/ai/flows/generate-motivational-tips';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export async function MotivationTip() {
  const tips = await generateMotivationalTips({
    studentName: 'دانش‌آموز',
    reportTrends: 'کاهش جزئی در ساعات مطالعه اما افزایش در درصد تست‌های صحیح.',
  });

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
        <p className="leading-relaxed">{tips.motivationalTips}</p>
      </CardContent>
    </Card>
  );
}
