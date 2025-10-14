import { Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { generateMotivationalTips } from '@/ai/flows/generate-motivational-tips';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { day: 'شنبه', hours: 4.5 },
  { day: 'یکشنبه', hours: 5 },
  { day: 'دوشنبه', hours: 3 },
  { day: 'سه‌شنبه', hours: 6 },
  { day: 'چهارشنبه', hours: 5.5 },
  { day: 'پنج‌شنبه', hours: 7 },
  { day: 'جمعه', hours: 4 },
];

const chartConfig = {
  hours: {
    label: 'ساعت مطالعه',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

async function MotivationTip() {
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

export default function PersonalStats() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">آمار شخصی</CardTitle>
          <CardDescription>روند پیشرفت شما در هفته اخیر</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <MotivationTip />
    </div>
  );
}
