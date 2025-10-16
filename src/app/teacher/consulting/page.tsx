'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle } from 'lucide-react';

export default function TeacherConsultingPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <BookOpen />
                            مدیریت مطالب مشاوره‌ای
                        </CardTitle>
                        <CardDescription>
                            مقالات، ویدیوها و محتوای مشاوره‌ای را برای دانش‌آموزان ایجاد و مدیریت کنید.
                        </CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        ایجاد مطلب جدید
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center h-96">
                        <h3 className="text-lg font-semibold">بخش مدیریت محتوای مشاوره‌ای</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            در این قسمت می‌توانید محتوای آموزشی و مشاوره‌ای جدید اضافه کرده و مطالب قبلی را ویرایش کنید.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
