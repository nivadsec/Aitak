'use client';

import { QuizForm } from '@/components/teacher/QuizForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewQuizPage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <FileText />
                    ایجاد آزمون جدید
                </CardTitle>
                <CardDescription>
                    اطلاعات و سوالات آزمون جدید را وارد کرده و آن را برای دانش‌آموزان منتشر کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <QuizForm onSuccess={() => router.push('/teacher/quizzes')} />
            </CardContent>
        </Card>
    )
}
