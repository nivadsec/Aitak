'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, Smartphone, Smile, Users, TrendingUp, BookOpen } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const weeklyStudyData = [
  { day: 'شنبه', hours: 4.2 },
  { day: '۱شنبه', hours: 3.5 },
  { day: '۲شنبه', hours: 5.1 },
  { day: '۳شنبه', hours: 4.8 },
  { day: '۴شنبه', hours: 6.2 },
  { day: '۵شنبه', hours: 3.1 },
  { day: 'جمعه', hours: 2.5 },
];

const subjectDistributionData = [
    { name: 'ریاضی', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'فیزیک', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'شیمی', value: 250, fill: 'hsl(var(--chart-3))' },
    { name: 'ادبیات', value: 200, fill: 'hsl(var(--chart-4))' },
    { name: 'سایر', value: 150, fill: 'hsl(var(--chart-5))' },
]

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل دانش‌آموزان</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">دانش‌آموز فعال در سیستم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین مطالعه (روزانه)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.1 ساعت</div>
            <p className="text-xs text-muted-foreground">٪۷+ نسبت به دیروز</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استفاده از موبایل</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 ساعت</div>
            <p className="text-xs text-muted-foreground">۱۲٪- نسبت به دیروز</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین رضایت (از ۱۰)</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.3</div>
            <p className="text-xs text-muted-foreground">میانگین کل کلاس‌ها</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle className="font-headline flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                روند مطالعه هفتگی
            </CardTitle>
            <CardDescription>میانگین ساعت مطالعه کل دانش‌آموزان در هفته گذشته</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={weeklyStudyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <PieChart>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={subjectDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={60}
                            paddingAngle={2}
                            labelLine={false}
                        >
                            {subjectDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
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
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
