'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { ScheduleItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, PlusCircle, Trash2, Edit, MoreVertical, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';


export default function TeacherSchedulePage() {
    const { firestore, user } = useFirebase();
    const [deletingItem, setDeletingItem] = React.useState<ScheduleItem | null>(null);
    const {toast} = useToast();

    const scheduleQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'schedule'), orderBy('dateTime', 'desc'));
    }, [firestore, user]);

    const { data: scheduleItems, isLoading } = useCollection<ScheduleItem>(scheduleQuery);

    const handleDelete = () => {
        if (!user || !deletingItem) return;
        const itemRef = doc(firestore, 'teachers', user.uid, 'schedule', deletingItem.id);
        deleteDocumentNonBlocking(itemRef);
        setDeletingItem(null);
        toast({ title: "جلسه حذف شد", variant: 'destructive'});
    };


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
                     <Button asChild>
                        <Link href="/teacher/schedule/new">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            ایجاد جلسه جدید
                        </Link>
                    </Button>
                </CardHeader>
                 <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : (
                        scheduleItems && scheduleItems.length > 0 ? (
                            <div className="space-y-4">
                                {scheduleItems.map(item => (
                                    <Card key={item.id}>
                                        <CardHeader className="flex-row items-start justify-between">
                                            <div>
                                                <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                                                <CardDescription>
                                                    {new Date(item.dateTime?.seconds * 1000).toLocaleString('fa-IR')}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/teacher/schedule/edit/${item.id}`}>
                                                            <Edit className="ml-2 h-4 w-4" /> ویرایش
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setDeletingItem(item)}><Trash2 className="ml-2 h-4 w-4" /> حذف</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center h-96">
                                <h3 className="text-lg font-semibold">هنوز جلسه‌ای ایجاد نشده است</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    برای ایجاد اولین جلسه، روی دکمه "ایجاد جلسه جدید" کلیک کنید.
                                </p>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                            آیا از حذف این جلسه مطمئن هستید؟
                        </AlertDialogTitle>
                        <AlertDialogDescription>این عمل قابل بازگشت نیست.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
