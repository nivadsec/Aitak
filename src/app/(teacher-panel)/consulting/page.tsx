'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { ConsultingContent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, PlusCircle, Trash2, Edit, MoreVertical, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';


export default function TeacherConsultingPage() {
    const { firestore, user } = useFirebase();
    const [deletingContent, setDeletingContent] = React.useState<ConsultingContent | null>(null);
    const {toast} = useToast();

    const contentQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'consultingContent'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: contents, isLoading } = useCollection<ConsultingContent>(contentQuery);

    const handleDelete = () => {
        if (!user || !deletingContent) return;
        const contentRef = doc(firestore, 'teachers', user.uid, 'consultingContent', deletingContent.id);
        deleteDocumentNonBlocking(contentRef);
        setDeletingContent(null);
        toast({ title: "مطلب حذف شد", variant: 'destructive'});
    };


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
                     <Button asChild>
                        <Link href="/teacher/consulting/new">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            ایجاد مطلب جدید
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
                        contents && contents.length > 0 ? (
                            <div className="space-y-4">
                                {contents.map(content => (
                                    <Card key={content.id}>
                                        <CardHeader className="flex-row items-start justify-between">
                                            <div>
                                                <CardTitle className="font-headline text-lg">{content.title}</CardTitle>
                                                <CardDescription>
                                                    منتشر شده در: {new Date(content.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/teacher/consulting/edit/${content.id}`}>
                                                            <Edit className="ml-2 h-4 w-4" /> ویرایش
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setDeletingContent(content)}><Trash2 className="ml-2 h-4 w-4" /> حذف</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center h-96">
                                <h3 className="text-lg font-semibold">هنوز مطلبی ایجاد نشده است</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    برای ایجاد اولین مطلب مشاوره‌ای، روی دکمه "ایجاد مطلب جدید" کلیک کنید.
                                </p>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deletingContent} onOpenChange={(open) => !open && setDeletingContent(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                            آیا از حذف این مطلب مطمئن هستید؟
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
