'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TeacherConsultingPage() {
    return (
        <Dialog>
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
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="ml-2 h-4 w-4" />
                                ایجاد مطلب جدید
                            </Button>
                        </DialogTrigger>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center h-96">
                            <h3 className="text-lg font-semibold">بخش مدیریت محتوay مشاوره‌ای</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                در این قسمت می‌توانید محتوای آموزشی و مشاوره‌ای جدید اضافه کرده و مطالب قبلی را ویرایش کنید.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">ایجاد مطلب مشاوره‌ای جدید</DialogTitle>
                    <DialogDescription>
                        اطلاعات مطلب جدید را برای انتشار وارد کنید.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            عنوان
                        </Label>
                        <Input id="title" placeholder="مثال: روش‌های مدیریت زمان" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="content" className="text-right">
                            محتوا
                        </Label>
                        <Textarea id="content" placeholder="محتوای مقاله یا توضیحات ویدیو را اینجا وارد کنید..." className="col-span-3 min-h-[100px]" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="videoUrl" className="text-right">
                            لینک ویدیو
                        </Label>
                        <Input id="videoUrl" placeholder="(اختیاری) لینک ویدیو در آپارات/یوتیوب" className="col-span-3" />
                    </div>
                </div>
                <div className="flex justify-end">
                     <Button type="submit">ذخیره مطلب</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
