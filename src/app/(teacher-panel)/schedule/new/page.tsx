'use client';

import { useRouter } from "next/navigation";
import { ScheduleForm } from "@/app/(teacher-panel)/schedule/ScheduleForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";


export default function NewScheduleItemPage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <Calendar />
                    ایجاد جلسه جدید
                </CardTitle>
                <CardDescription>
                    اطلاعات جلسه جدید را برای افزودن به برنامه کلاسی وارد کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScheduleForm onSuccess={() => router.push('/teacher/schedule')} />
            </CardContent>
        </Card>
    )
}
