'use client';

import * as React from 'react';
import { Check, CheckCircle2, Clock, Lock, Unlock } from 'lucide-react';
import type { StudentRecommendation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface RecommendationsListProps {
  recommendations: StudentRecommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center h-48">
        <h3 className="text-sm font-semibold text-muted-foreground">هنوز توصیه‌ای ارسال نشده است</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          توصیه‌های ارسالی در اینجا نمایش داده می‌شوند.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <div key={rec.id} className="border p-4 rounded-lg space-y-3">
          <p className="text-sm text-foreground leading-relaxed">{rec.content}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-4">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className={cn(
                                "flex items-center gap-1.5",
                                rec.isRead ? "text-green-600" : "text-amber-600"
                            )}>
                                {rec.isRead ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                {rec.isRead ? 'خوانده شده' : 'خوانده نشده'}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                        {rec.isRead ? `در تاریخ ${new Date((rec.readAt as any)?.seconds * 1000).toLocaleString('fa-IR')}` : 'هنوز توسط دانش‌آموز خوانده نشده'}
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>

                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className={cn(
                                "flex items-center gap-1.5",
                                rec.isBlocking ? "text-destructive" : "text-muted-foreground"
                            )}>
                                {rec.isBlocking ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                {rec.isBlocking ? 'قفل فعال' : 'بدون قفل'}
                            </span>
                        </TooltipTrigger>
                         <TooltipContent>
                        {rec.isBlocking ? 'ثبت گزارش تا زمان خواندن این توصیه قفل است' : 'این توصیه گزارش کار را قفل نمی‌کند'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>
             <span>{new Date(rec.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
