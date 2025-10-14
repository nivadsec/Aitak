'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, Home, Users, BarChart3, MessageSquare } from 'lucide-react';

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

type AppSidebarProps = {
  role: 'student' | 'teacher';
};

const studentNav = [
  { href: '/student/dashboard', label: 'گزارش روزانه', icon: Home },
  { href: '/student/stats', label: 'آمار من', icon: BarChart3 },
];

const teacherNav = [
  { href: '/teacher/dashboard', label: 'داشبورد', icon: Home },
  { href: '/teacher/students', label: 'دانش‌آموزان', icon: Users },
  { href: '/teacher/messages', label: 'پیام‌ها', icon: MessageSquare },
];

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'student' ? studentNav : teacherNav;

  return (
    <Sidebar side="right" variant="inset" collapsible="icon">
      <SidebarHeader className="items-center justify-center p-4">
        <Link href="/">
            <Logo className="h-8 w-8 text-primary" />
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter>
         {/* Can add footer items here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
