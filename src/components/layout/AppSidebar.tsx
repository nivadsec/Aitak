'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, Home, Users, BarChart3, MessageSquare, Megaphone, ClipboardPen, ClipboardEdit, BrainCircuit, Settings, Lightbulb, Bot, FileText, Calendar, BookOpen, Map, History, ShieldCheck, ClipboardCheck, HelpCircle, ClipboardList } from 'lucide-react';
import React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { Separator } from '@/components/ui/separator';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import type { Student } from '@/lib/types';
import { doc } from 'firebase/firestore';

type AppSidebarProps = {
  role: 'student' | 'teacher';
};

const allStudentNav = [
  { href: '/student/dashboard', label: 'داشبورد', icon: Home, feature: 'core' },
  { href: '/student/daily-report', label: 'گزارش روزانه', icon: ClipboardEdit, feature: 'canSubmitDailyReport' },
  { href: '/student/focus', label: 'نردبان تمرکز', icon: BrainCircuit, feature: 'canSubmitFocusLadder' },
  { href: '/student/weekly-progress', label: 'گزارش هفتگی', icon: BookCopy, feature: 'canSubmitWeeklyReport' },
  { href: '/student/topic-investment', label: 'روندنمای درسی', icon: BarChart3, feature: 'canSubmitTopicInvestment' },
  { type: 'separator' },
  { href: '/student/exam-analysis', label: 'تحلیل آزمون عددمحور', icon: ClipboardPen, feature: 'canSubmitExamAnalysis' },
  { href: '/student/overall-exam-analysis', label: 'تحلیل آزمون کلی', icon: ClipboardCheck, feature: 'canSubmitOverallExamAnalysis' },
  { href: '/student/tests', label: 'آزمون‌های آنلاین', icon: ClipboardList, feature: 'canViewTests' },
  { href: '/student/questionnaires', label: 'پرسشنامه‌ها', icon: FileText, feature: 'canViewQuestionnaires' },
  { type: 'separator' },
  { href: '/student/stats', label: 'آمار عملکرد', icon: BarChart3, feature: 'canViewStats' },
  { href: '/student/strategic-plans', label: 'برنامه راهبردی', icon: Map, feature: 'canViewStrategicPlans' },
  { href: '/student/schedule', label: 'برنامه کلاسی', icon: Calendar, feature: 'canViewSchedule' },
  { href: '/student/consulting', label: 'محتوای مشاوره‌ای', icon: BookOpen, feature: 'canViewConsultingContent' },
  { href: '/student/qa', label: 'پرسش و پاسخ', icon: HelpCircle, feature: 'core' },
  { type: 'separator' },
  { href: '/student/settings', label: 'تنظیمات', icon: Settings, feature: 'core' },
];

const teacherNav = [
  { href: '/teacher/dashboard', label: 'داشبورد', icon: Home },
  { href: '/teacher/students', label: 'دانش‌آموزان', icon: Users },
  { href: '/teacher/permissions', label: 'دسترسی‌ها', icon: ShieldCheck },
  { href: '/teacher/qa', label: 'پرسش و پاسخ', icon: HelpCircle },
  { href: '/teacher/strategic-plans', label: 'برنامه راهبردی', icon: Map },
  { href: '/teacher/tests', label: 'آزمون‌های آنلاین', icon: ClipboardList },
  { href: '/teacher/questionnaires', label: 'پرسشنامه‌ها', icon: FileText },
  { href: '/teacher/recommendations', label: 'توصیه‌ها', icon: Lightbulb },
  { href: '/teacher/messages', label: 'پیام‌ها', icon: MessageSquare },
  { href: '/teacher/announcements', label: 'اطلاعیه‌ها', icon: Megaphone },
  { href: '/teacher/assistant', label: 'ربات هوشمند', icon: Bot },
  { href: '/teacher/schedule', label: 'برنامه کلاسی', icon: Calendar },
  { href: '/teacher/consulting', label: 'مطالب مشاوره‌ای', icon: BookOpen },
  { href: '/teacher/history', label: 'تاریخچه ورود', icon: History },
  { href: '/teacher/settings', label: 'تنظیمات', icon: Settings },
];

function StudentSidebarNav() {
    const pathname = usePathname();
    const { user, firestore, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const studentRef = useMemoFirebase(() => {
        if (!user || !teacherId) return null;
        return doc(firestore, 'teachers', teacherId, 'students', user.uid);
    }, [firestore, user, teacherId]);

    const { data: student } = useDoc<Student>(studentRef);

    const availableNavs = React.useMemo(() => {
        if (!student) {
            // While loading or if student doc doesn't exist, only show core items
            return allStudentNav.filter(item => item.feature === 'core' || item.type === 'separator');
        }

        return allStudentNav.filter(item => {
            if (item.type === 'separator') return true;
            if (item.feature === 'core') return true;
            // The feature flag can be undefined, so we check for explicit false
            return student[item.feature as keyof Student] !== false;
        });
    }, [student]);

    return (
         <SidebarMenu>
          {availableNavs.map((item, index) => {
            if (item.type === 'separator') {
              return <Separator key={`sep-${index}`} className="my-1" />;
            }
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href!)}
                  tooltip={{ children: item.label, side: 'left', className: 'font-body' }}
                >
                  <Link href={item.href!}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
    )
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'teacher' ? teacherNav : [];

  return (
    <Sidebar side="right" variant="inset" collapsible="icon">
      <SidebarHeader className="items-center justify-center p-4">
        <Link href="/">
            <Logo className="h-8 w-8 text-primary" />
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        {role === 'student' ? (
            <StudentSidebarNav />
        ) : (
            <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, side: 'left', className: 'font-body' }}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
         {/* Can add footer items here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
