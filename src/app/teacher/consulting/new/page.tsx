'use client';

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { ContentForm } from "../ContentForm";


export default function NewContentPage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <BookOpen />
                    ایجاد مطلب مشاوره‌ای جدید
                </CardTitle>
                <CardDescription>
                    اطلاعات مطلب جدید را برای افزودن به لیست محتوا وارد کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ContentForm onSuccess={() => router.push('/teacher/consulting')} />
            </CardContent>
        </Card>
    )
}
