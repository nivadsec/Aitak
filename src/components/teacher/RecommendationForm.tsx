'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Send } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const formSchema = z.object({
  content: z.string().min(10, 'متن توصیه باید حداقل ۱۰ کاراکتر باشد.'),
  isBlocking: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface RecommendationFormProps {
  studentId: string;
}

export function RecommendationForm({ studentId }: RecommendationFormProps) {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      isBlocking: false,
    },
  });

  async function onSubmit(data: FormValues) {
    if (!user) {
      toast({
        title: 'خطا',
        description: 'برای انجام این عملیات باید وارد شده باشید.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      const recommendationsCol = collection(firestore, 'teachers', user.uid, 'students', studentId, 'recommendations');
      const newDocRef = doc(recommendationsCol);

      const recommendationData = {
        id: newDocRef.id,
        studentId,
        teacherId: user.uid,
        content: data.content,
        isBlocking: data.isBlocking,
        isRead: false,
        createdAt: serverTimestamp(),
      };
      
      setDocumentNonBlocking(newDocRef, recommendationData, {});
      
      toast({
        title: 'توصیه ارسال شد',
        description: 'توصیه شما با موفقیت برای دانش‌آموز ارسال شد.',
      });
      
      form.reset({ content: '', isBlocking: false });

    } catch (error: any) {
      console.error('Error sending recommendation:', error);
      toast({
        title: 'خطا در ارسال',
        description: error.message || 'مشکلی در هنگام ارسال توصیه پیش آمد.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">متن توصیه</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="توصیه خود را در اینجا بنویسید..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isBlocking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="isBlockingSwitch">قفل کردن گزارش کار</Label>
                    <FormDescription className='text-xs'>
                        تا زمان خواندن این توصیه، دانش‌آموز نتواند گزارش ثبت کند.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                        id="isBlockingSwitch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
            ارسال توصیه
          </Button>
        </div>
      </form>
    </Form>
  );
}
