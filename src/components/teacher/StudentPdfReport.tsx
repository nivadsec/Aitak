'use client';

import React from 'react';
import type { Student, FocusInterval } from '@/lib/types';
import StudentPerformanceAnalysis from './StudentPerformanceAnalysis';
import { FocusIntervalsChart } from './FocusIntervalsChart';
import { Logo } from '../icons/logo';

interface StudentPdfReportProps {
  student: Student;
  dailyReports: any[];
  focusIntervals: FocusInterval[];
}

// This component is designed to be rendered off-screen for PDF generation
export function StudentPdfReport({ student, dailyReports, focusIntervals }: StudentPdfReportProps) {
  return (
    <div className="p-8 bg-white font-body" dir="rtl">
        {/* Report Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-8">
            <div className="text-right">
                <h1 className="text-3xl font-bold font-headline text-gray-800">گزارش عملکرد دانش‌آموز</h1>
                <h2 className="text-xl font-headline text-primary">{student.firstName} {student.lastName}</h2>
                <p className="text-sm text-gray-500">تاریخ گزارش: {new Date().toLocaleDateString('fa-IR')}</p>
            </div>
            <Logo className="h-20 w-20 text-primary" />
        </div>

        <div className="space-y-8">
            {/* AI Analysis Section */}
            <div className="break-after-page">
              <StudentPerformanceAnalysis studentId={student.id} dailyReports={dailyReports} />
            </div>

            {/* Focus Chart Section */}
            {focusIntervals && focusIntervals.length > 0 && (
                <div className="pt-8">
                    <FocusIntervalsChart intervals={focusIntervals} />
                </div>
            )}
        </div>

         {/* Report Footer */}
        <div className="text-center mt-12 pt-4 border-t">
            <p className="text-xs text-gray-400">
                این گزارش توسط پلتفرم هوشمند خودارزیابی آی‌تاب تولید شده است.
            </p>
        </div>
    </div>
  );
}
