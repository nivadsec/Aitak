'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { ConsultingContent } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';


const contentSchema = z.object({
  title: z.string().min(5, 'عنوان باید حداقل ۵ کاراکتر باشد.'),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد.'),
  videoUrl: z.string().url('آدرس ویدیو باید یک URL معتبر باشد.').optional().or(z.literal('')),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentFormProps {
    content?: ConsultingContent;
    onSuccess: () => void;
}

export function ContentForm({ content, onSuccess }: ContentFormProps) {
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
      createdAt: isEditMode && content ? content.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEditMode && content) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>عنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem><FormLabel>محتوا (مقاله)</FormLabel><FormControl><Textarea {...field} rows={10} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="videoUrl" render={({ field }) => (
          <FormItem><FormLabel>لینک ویدیو (اختیاری)</FormLabel><FormControl><Input placeholder="https://aparat.com/v/xyz" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isEditMode ? 'ذخیره تغییرات' : 'ایجاد مطلب'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
