
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import type { ConsultingContent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, PlusCircle, Trash2, Edit, MoreVertical, AlertTriangle } from 'lucide-react';
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

const contentSchema = z.object({
  title: z.string().min(5, 'عنوان باید حداقل ۵ کاراکتر باشد.'),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد.'),
  videoUrl: z.string().url('آدرس ویدیو باید یک URL معتبر باشد.').optional().or(z.literal('')),
});

type ContentFormValues = z.infer<typeof contentSchema>;

function ContentForm({ content, onSuccess }: { content?: ConsultingContent, onSuccess: () => void }) {
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!content;

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: content?.title || '',
      content: content?.content || '',
      videoUrl: content?.videoUrl || '',
    },
  });

  async function onSubmit(data: ContentFormValues) {
    if (!user) return;
    setIsLoading(true);

    const contentData = {
      teacherId: user.uid,
      ...data,
      createdAt: isEditMode ? content.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEditMode) {
        const contentRef = doc(firestore, 'teachers', user.uid, 'consultingContent', content.id);
        await updateDocumentNonBlocking(contentRef, contentData);
        toast({ title: 'مطلب به‌روزرسانی شد' });
      } else {
        const newContentRef = doc(collection(firestore, 'teachers', user.uid, 'consultingContent'));
        await setDocumentNonBlocking(newContentRef, { ...contentData, id: newContentRef.id }, {});
        toast({ title: 'مطلب جدید ایجاد شد' });
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
          <FormItem><FormLabel>عنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem><FormLabel>محتوا (مقاله)</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="videoUrl" render={({ field }) => (
          <FormItem><FormLabel>لینک ویدیو (اختیاری)</FormLabel><FormControl><Input placeholder="https://aparat.com/v/xyz" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{isEditMode ? 'ذخیره تغییرات' : 'ایجاد مطلب'}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function TeacherConsultingPage() {
    const { firestore, user } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingContent, setEditingContent] = React.useState<ConsultingContent | undefined>(undefined);
    const [deletingContent, setDeletingContent] = React.useState<ConsultingContent | null>(null);
    const {toast} = useToast();

    const contentQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'consultingContent'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: contents, isLoading } = useCollection<ConsultingContent>(contentQuery);

    const openEditDialog = (content: ConsultingContent) => {
        setEditingContent(content);
        setIsDialogOpen(true);
    };
    
    const openNewDialog = () => {
        setEditingContent(undefined);
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (!user || !deletingContent) return;
        const contentRef = doc(firestore, 'teachers', user.uid, 'consultingContent', deletingContent.id);
        deleteDocumentNonBlocking(contentRef);
        setDeletingContent(null);
        toast({ title: "مطلب حذف شد", variant: 'destructive'});
    };


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                         <Button onClick={openNewDialog}>
                            <PlusCircle className="ml-2 h-4 w-4" />
                            ایجاد مطلب جدید
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
                                                        <DropdownMenuItem onClick={() => openEditDialog(content)}><Edit className="ml-2 h-4 w-4" /> ویرایش</DropdownMenuItem>
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
                 <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{editingContent ? 'ویرایش مطلب' : 'ایجاد مطلب جدید'}</DialogTitle>
                        <DialogDescription>{editingContent ? 'اطلاعات مطلب را ویرایش کنید.' : 'اطلاعات مطلب جدید را وارد کنید.'}</DialogDescription>
                    </DialogHeader>
                    <ContentForm content={editingContent} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>

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
        </Dialog>
    );
}

    