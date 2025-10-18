
'use client'
import { MotivationTip } from '@/components/student/MotivationTip';
import PersonalStats from '@/components/student/PersonalStats';
import { StudentRecommendationCard } from '@/components/student/StudentRecommendationCard';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase, FirestorePermissionError, errorEmitter, useDoc } from '@/firebase';
import { downloadJson } from '@/lib/utils';
import { collection, doc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { Download, ClipboardEdit, BrainCircuit, ClipboardPen, BookCopy, BarChart3, HelpCircle, FileText, Map, Calendar, BookOpen, ClipboardCheck, ClipboardList, LineChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Student, DailyReport } from '@/lib/types';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getDailyReportsForGenkit } from '@/lib/data';
import StudentPerformanceAnalysis from '@/components/teacher/StudentPerformanceAnalysis';
import { DashboardStatsCard } from '@/components/student/DashboardStatsCard';


// Helper function to create a simple trend description
const createTrendDescription = (reports: DailyReport[]): string => {
    if (reports.length < 2) {
        return "گزارش‌های کافی برای تحلیل روند وجود ندارد.";
    }
    const latest = reports[0];
    const previous = reports[1];

    const latestStudyTime = (latest.items || []).reduce((sum, item) => sum + (item.studyTime || 0), 0);
    const previousStudyTime = (previous.items || []).reduce((sum, item) => sum + (item.studyTime || 0), 0);

    let trend = "";
    if (latestStudyTime > previousStudyTime) {
        trend += "افزایش در ساعت مطالعه";
    } else if (latestStudyTime < previousStudyTime) {
        trend += "کاهش در ساعت مطالعه";
    } else {
        trend += "ثبات در ساعت مطالعه";
    }

    if (latest.disasterLevel > previous.disasterLevel) {
        trend += " و بهبود در وضعیت روانی";
    } else if (latest.disasterLevel < previous.disasterLevel) {
        trend += " و افت در وضعیت روانی";
    }

    return trend + ".";
};

function ActionCard({ title, description, icon: Icon, href, buttonText }: {title: string, description: string, icon: React.ElementType, href: string, buttonText: string}) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="flex-row items-start gap-4 pb-4 flex-grow">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-headline text-lg">{title}</CardTitle>
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
            <Button asChild className="w-full">
              <Link href={href}>{buttonText}</Link>
            </Button>
        </CardFooter>
      </Card>
    );
}

const actionCards = [
    {
      title: "گزارش روزانه",
      description: "ثبت و تحلیل عملکرد روزانه در مطالعه و فعالیت‌ها.",
      icon: ClipboardEdit,
      href: "/student/daily-report",
      buttonText: "ثبت گزارش روزانه"
    },
    {
      title: "نردبان تمرکز",
      description: "امتیاز تمرکز خود را در هر بازه مطالعه ثبت کنید.",
      icon: BrainCircuit,
      href: "/student/focus",
      buttonText: "ورود به نردبان"
    },
    {
      title: "گزارش هفتگی",
      description: "پیشرفت هفتگی خود را ارزیابی و ثبت کنید.",
      icon: BookCopy,
      href: "/student/weekly-progress",
      buttonText: "ثبت گزارش هفتگی"
    },
    {
      title: "تحلیل آزمون عددمحور",
      description: "عملکرد خود را در آزمون‌ها به صورت کمی وارد کنید.",
      icon: ClipboardPen,
      href: "/student/exam-analysis",
      buttonText: "شروع تحلیل"
    },
     {
      title: "تحلیل آزمون کلی",
      description: "روند پیشرفت خود را در هر درس در طول زمان تحلیل کنید.",
      icon: ClipboardCheck,
      href: "/student/overall-exam-analysis",
      buttonText: "شروع تحلیل کلی"
    },
     {
      title: "چک‌لیست تفصیلی آزمون",
      description: "میزان آمادگی خود را قبل از هر آزمون بسنجید.",
      icon: ClipboardCheck,
      href: "/student/detailed-exam-checklist",
      buttonText: "شروع چک‌لیست"
    },
    {
      title: "روندنمای درسی",
      description: "مسیر یادگیری هر درس را گام‌به‌گام برنامه‌ریزی کنید.",
      icon: BarChart3,
      href: "/student/topic-investment",
      buttonText: "ورود به روندنما"
    },
    {
      title: "برنامه راهبردی",
      description: "برنامه‌های راهبردی آزمون‌ها را مشاهده و دانلود کنید.",
      icon: Map,
      href: "/student/strategic-plans",
      buttonText: "مشاهده برنامه‌ها"
    },
     {
      title: "برنامه کلاسی",
      description: "برنامه‌های کلاسی و جلسات مشاوره خود را مشاهده کنید.",
      icon: Calendar,
      href: "/student/schedule",
      buttonText: "مشاهده برنامه"
    },
    {
      title: "آزمون‌های آنلاین",
      description: "در آزمون‌های آنلاین درسی که توسط معلم طراحی شده شرکت کنید.",
      icon: ClipboardList,
      href: "/student/tests",
      buttonText: "مشاهده آزمون‌ها"
    },
    {
      title: "پرسشنامه‌ها",
      description: "در پرسشنامه‌های هوش و شخصیت‌شناسی شرکت کنید.",
      icon: FileText,
      href: "/student/questionnaires",
      buttonText: "مشاهده پرسشنامه‌ها"
    },
    {
      title: "پرسش و پاسخ",
      description: "سوالات خود را مستقیماً از معلم خود بپرسید.",
      icon: HelpCircle,
      href: "/student/qa",
      buttonText: "ورود به پرسش و پاسخ"
    }
  ];


export default function StudentDashboardPage() {
  const { firestore, user, role } = useFirebase();
  const { toast } = useToast();
  
  const teacherId = role?.split(':')[1];

  // Fetch student document for feature flags
  const studentDocRef = useMemoFirebase(() => {
    if (!user || !teacherId) return null;
    return doc(firestore, 'teachers', teacherId, 'students', user.uid);
  }, [firestore, user, teacherId]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  // Fetch the latest 2 reports for trend analysis
  const reportsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !teacherId) return null;
    return query(
        collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports'),
        orderBy('date', 'desc'),
        limit(14)
    );
  }, [firestore, user, teacherId]);

  // Fetch the latest unread recommendation
  const recommendationQuery = useMemoFirebase(() => {
      if (!user || !firestore || !teacherId) return null;
      return query(
          collection(firestore, 'teachers', teacherId, 'students', user.uid, 'recommendations'),
          where('isRead', '==', false),
          orderBy('createdAt', 'desc'),
          limit(1)
      )
  }, [firestore, user, teacherId]);

  const { data: reports, isLoading: isReportLoading } = useCollection<DailyReport>(reportsQuery);
  const { data: recommendations, isLoading: isRecommendationLoading } = useCollection<any>(recommendationQuery);
  
  const dailyReportsForGenkit = useMemo(() => getDailyReportsForGenkit(reports?.slice(0, 14) || []), [reports]);
  const latestReport = reports?.[0];
  const unreadRecommendation = recommendations?.[0];
  const trendDescription = useMemo(() => reports ? createTrendDescription(reports) : undefined, [reports]);

  const handleExportData = async () => {
     if (!user || !firestore || !teacherId) {
        toast({
            title: "خطا",
            description: "برای خروجی گرفتن باید وارد شده باشید و اطلاعات شما در دسترس باشد.",
            variant: "destructive",
        });
        return;
    }
    toast({
        title: "در حال آماده‌سازی...",
        description: "لطفا صبر کنید، در حال جمع‌آوری اطلاعات شما هستیم.",
    });

    const studentDocRef = doc(firestore, `teachers/${teacherId}/students`, user.uid);
    const fullStudentData = student; // Already fetched with useDoc

    const exportData: any = {
      ...fullStudentData,
      dailyReports: []
    };
    
    const reportsCollectionRef = collection(firestore, 'teachers', teacherId, 'students', user.uid, 'dailyReports');
    const reportsSnapshot = await getDocs(reportsCollectionRef).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: reportsCollectionRef.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError; // Stop further execution
    });

     for (const reportDoc of reportsSnapshot.docs) {
        const reportData = reportDoc.data();
        const subjectItemsQuery = query(collection(reportDoc.ref, 'subjectItems'));
        const subjectItemsSnapshot = await getDocs(subjectItemsQuery).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: collection(reportDoc.ref, 'subjectItems').path,
                operation: 'list'
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // Stop further execution
        });
        const subjectItems = subjectItemsSnapshot.docs.map(d => d.data());
        (reportData as any).subjectItems = subjectItems;
        exportData.dailyReports.push(reportData);
    }

    downloadJson(exportData, `itab_backup_${user.displayName?.replace(' ', '_') || user.uid}.json`);
     toast({
        title: "پشتیبان‌گیری کامل شد",
        description: "فایل JSON اطلاعات شما دانلود شد.",
    });
  };

  return (
    <div className="space-y-6">
        {unreadRecommendation && (
            <StudentRecommendationCard recommendation={unreadRecommendation} />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {student?.canViewDailyAnalysis && (
                <StudentPerformanceAnalysis studentId={user?.uid || ''} dailyReports={dailyReportsForGenkit} />
            )}
            <DashboardStatsCard reports={reports || []} />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">دسترسی سریع</CardTitle>
                <CardDescription>تمام ابزارهای شما برای یک مطالعه هدفمند</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {actionCards.map(card => (
                        <ActionCard key={card.href} {...card} />
                    ))}
                </div>
            </CardContent>
        </Card>


        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
                 <PersonalStats report={latestReport} isLoading={isReportLoading || isRecommendationLoading || isStudentLoading} />
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <MotivationTip 
                    reportTrends={trendDescription} 
                    studentName={user?.displayName?.split(' ')[0]} 
                />
                <div className="text-center">
                    <Button variant="outline" onClick={handleExportData} disabled={!user || !teacherId}>
                        <Download className="ml-2 h-4 w-4" />
                        پشتیبان‌گیری از اطلاعات من
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
