'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, PlusCircle } from 'lucide-react';

export default function TeacherSchedulePage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <Calendar />
                            مدیریت برنامه کلاسی
                        </CardTitle>
                        <CardDescription>
                            جلسات آنلاین و برنامه‌های کلاسی دانش‌آموزان را مدیریت کنید.
                        </CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        ایجاد جلسه جدید
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center h-96">
                        <h3 className="text-lg font-semibold">بخش مدیریت برنامه کلاسی</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            در این قسمت می‌توانید جلسات آنلاین جدید تعریف کرده و برنامه‌های موجود را مشاهده و ویرایش کنید.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
