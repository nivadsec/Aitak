'use client';

import { QuestionnaireForm } from '@/components/teacher/QuestionnaireForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewQuestionnairePage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <FileText />
                    ایجاد پرسشنامه جدید
                </CardTitle>
                <CardDescription>
                    اطلاعات و سوالات پرسشنامه جدید را وارد کرده و آن را برای دانش‌آموزان منتشر کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <QuestionnaireForm onSuccess={() => router.push('/teacher/questionnaires')} />
            </CardContent>
        </Card>
    )
}
