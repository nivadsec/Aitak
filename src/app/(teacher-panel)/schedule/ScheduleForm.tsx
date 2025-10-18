'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { ScheduleItem } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

const scheduleSchema = z.object({
  title: z.string().min(3, 'عنوان جلسه باید حداقل ۳ کاراکتر باشد.'),
  description: z.string().optional(),
  dateTime: z.string().refine(val => !isNaN(Date.parse(val)), { message: "تاریخ و ساعت معتبر نیست." }),
  link: z.string().url('لینک جلسه باید یک URL معتبر باشد.').optional().or(z.literal('')),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
    item?: ScheduleItem;
    onSuccess: () => void;
}

export function ScheduleForm({ item, onSuccess }: ScheduleFormProps) {
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
      createdAt: isEditMode && item ? item.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEditMode && item) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isEditMode ? 'ذخیره تغییرات' : 'ایجاد جلسه'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
