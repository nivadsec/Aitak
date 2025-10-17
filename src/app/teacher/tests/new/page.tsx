
'use client';

import { TestForm } from '@/components/teacher/TestForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewTestPage() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <ClipboardList />
                    ایجاد آزمون آنلاین جدید
                </CardTitle>
                <CardDescription>
                    اطلاعات و سوالات آزمون جدید را وارد کرده و آن را برای دانش‌آموزان منتشر کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TestForm onSuccess={() => router.push('/teacher/tests')} />
            </CardContent>
        </Card>
    )
}
