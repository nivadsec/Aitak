'use client';

import { AnnouncementsList } from '@/components/teacher/AnnouncementsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AnnouncementForm } from '@/components/teacher/AnnouncementForm';
import React from 'react';

export default function TeacherAnnouncementsPage() {
    const { firestore, user } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);


    const announcementsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'announcements'), orderBy('timestamp', 'desc'));
    }, [firestore, user]);

    const { data: announcements, isLoading } = useCollection(announcementsQuery);

    return (
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline text-xl flex items-center gap-2">
                                <Megaphone />
                                مدیریت اطلاعیه‌ها
                            </CardTitle>
                            <CardDescription>
                                اطلاعیه‌های عمومی را ویرایش، حذف یا یک مورد جدید ایجاد کنید.
                            </CardDescription>
                        </div>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="ml-2 h-4 w-4" />
                                اطلاعیه جدید
                            </Button>
                        </DialogTrigger>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ) : (
                            <AnnouncementsList announcements={announcements || []} />
                        )}
                    </CardContent>
                </Card>
                 <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2">
                        <Megaphone />
                        ارسال اطلاعیه عمومی
                    </DialogTitle>
                    <DialogDescription>
                        این اطلاعیه برای همه کاربران در صفحه اصلی نمایش داده می‌شود.
                    </DialogDescription>
                    </DialogHeader>
                    <AnnouncementForm onSuccess={() => setIsDialogOpen(false)} announcement={null} />
                </DialogContent>
            </div>
        </Dialog>
    );
}
