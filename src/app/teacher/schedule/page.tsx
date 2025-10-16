'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function TeacherSchedulePage() {
    return (
        <Dialog>
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
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="ml-2 h-4 w-4" />
                                ایجاد جلسه جدید
                            </Button>
                        </DialogTrigger>
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">ایجاد جلسه جدید</DialogTitle>
                    <DialogDescription>
                        اطلاعات جلسه جدید را برای دانش‌آموزان وارد کنید.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            عنوان
                        </Label>
                        <Input id="title" placeholder="مثال: کلاس رفع اشکال حسابان" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="datetime" className="text-right">
                            تاریخ و ساعت
                        </Label>
                        <Input id="datetime" type="datetime-local" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="link" className="text-right">
                            لینک جلسه
                        </Label>
                        <Input id="link" placeholder="https://meet.google.com/xyz-abc-def" className="col-span-3" />
                    </div>
                </div>
                <div className="flex justify-end">
                     <Button type="submit">ذخیره جلسه</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
