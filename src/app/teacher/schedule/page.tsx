
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import type { ScheduleItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, PlusCircle, Trash2, Edit, MoreVertical, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const scheduleSchema = z.object({
  title: z.string().min(3, 'عنوان جلسه باید حداقل ۳ کاراکتر باشد.'),
  description: z.string().optional(),
  dateTime: z.string().refine(val => !isNaN(Date.parse(val)), { message: "تاریخ و ساعت معتبر نیست." }),
  link: z.string().url('لینک جلسه باید یک URL معتبر باشد.').optional().or(z.literal('')),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

function ScheduleForm({ item, onSuccess }: { item?: ScheduleItem, onSuccess: () => void }) {
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!item;

  const toDateTimeLocal = (date: Date) => {
    const ten = (i: number) => (i < 10 ? '0' : '') + i;
    const YYYY = date.getFullYear();
    const MM = ten(date.getMonth() + 1);
    const DD = ten(date.getDate());
    const HH = ten(date.getHours());
    const mm = ten(date.getMinutes());
    return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
  };

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      dateTime: item?.dateTime ? toDateTimeLocal(new Date(item.dateTime.seconds * 1000)) : '',
      link: item?.link || '',
    },
  });

  async function onSubmit(data: ScheduleFormValues) {
    if (!user) return;
    setIsLoading(true);

    const scheduleData = {
      teacherId: user.uid,
      title: data.title,
      description: data.description,
      dateTime: new Date(data.dateTime),
      link: data.link,
      createdAt: isEditMode ? item.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEditMode) {
        const itemRef = doc(firestore, 'teachers', user.uid, 'schedule', item.id);
        await updateDocumentNonBlocking(itemRef, scheduleData);
        toast({ title: 'جلسه به‌روزرسانی شد' });
      } else {
        const newItemRef = doc(collection(firestore, 'teachers', user.uid, 'schedule'));
        await setDocumentNonBlocking(newItemRef, { ...scheduleData, id: newItemRef.id }, {});
        toast({ title: 'جلسه جدید ایجاد شد' });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({ title: 'خطا در ذخیره‌سازی', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>عنوان جلسه</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>توضیحات</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="dateTime" render={({ field }) => (
          <FormItem><FormLabel>تاریخ و ساعت</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="link" render={({ field }) => (
          <FormItem><FormLabel>لینک جلسه</FormLabel><FormControl><Input placeholder="https://meet.google.com/xyz-abc-def" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{isEditMode ? 'ذخیره تغییرات' : 'ایجاد جلسه'}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function TeacherSchedulePage() {
    const { firestore, user } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<ScheduleItem | undefined>(undefined);
    const [deletingItem, setDeletingItem] = React.useState<ScheduleItem | null>(null);
    const {toast} = useToast();

    const scheduleQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'schedule'), orderBy('dateTime', 'desc'));
    }, [firestore, user]);

    const { data: scheduleItems, isLoading } = useCollection<ScheduleItem>(scheduleQuery);

    const openEditDialog = (item: ScheduleItem) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };
    
    const openNewDialog = () => {
        setEditingItem(undefined);
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (!user || !deletingItem) return;
        const itemRef = doc(firestore, 'teachers', user.uid, 'schedule', deletingItem.id);
        deleteDocumentNonBlocking(itemRef);
        setDeletingItem(null);
        toast({ title: "جلسه حذف شد", variant: 'destructive'});
    };


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                         <Button onClick={openNewDialog}>
                            <PlusCircle className="ml-2 h-4 w-4" />
                            ایجاد جلسه جدید
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
                                                        <DropdownMenuItem onClick={() => openEditDialog(item)}><Edit className="ml-2 h-4 w-4" /> ویرایش</DropdownMenuItem>
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
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{editingItem ? 'ویرایش جلسه' : 'ایجاد جلسه جدید'}</DialogTitle>
                        <DialogDescription>{editingItem ? 'اطلاعات جلسه را ویرایش کنید.' : 'اطلاعات جلسه جدید را وارد کنید.'}</DialogDescription>
                    </DialogHeader>
                    <ScheduleForm item={editingItem} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>

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
        </Dialog>
    );
}

    