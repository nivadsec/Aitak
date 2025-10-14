'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BrainCircuit, CheckCircle2, Smile, Smartphone } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, footer, colorClass }) => (
    <Card>
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


export default function PersonalStats({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            آمار کلیدی شما
          </CardTitle>
          <CardDescription>خلاصه عملکرد شما در این هفته</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    icon={BrainCircuit}
                    title="میانگین مطالعه"
                    value="۴.۵ ساعت"
                    footer="میانگین روزانه"
                    colorClass="text-primary"
                />
                <StatCard 
                    icon={CheckCircle2}
                    title="دقت تست"
                    value="۸۲٪"
                    footer="میانگین هفتگی"
                    colorClass="text-green-500"
                />
                 <StatCard 
                    icon={Smile}
                    title="شاخص روانی"
                    value="۷.۵"
                    footer="میانگین از ۱۰"
                    colorClass="text-amber-500"
                />
                 <StatCard 
                    icon={Smartphone}
                    title="استفاده از موبایل"
                    value="۱.۸ ساعت"
                    footer="میانگین روزانه"
                    colorClass="text-red-500"
                />
            </div>
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
