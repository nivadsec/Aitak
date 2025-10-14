'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Send, Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const formSchema = z.object({
    content: z.string().min(10, 'متن اطلاعیه باید حداقل ۱۰ کاراکتر باشد.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AnnouncementFormProps {
    announcement?: { id: string, content: string } | null;
    onSuccess: () => void;
}

export function AnnouncementForm({ announcement, onSuccess }: AnnouncementFormProps) {
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const [isLoading, setIsLoading] = React.useState(false);
    const isEditMode = !!announcement;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: announcement?.content || '',
        },
    });

     React.useEffect(() => {
        form.reset({ content: announcement?.content || '' });
    }, [announcement, form]);


    async function onSubmit(data: FormValues) {
        if (!user) {
            toast({
                title: "خطا",
                description: "برای انجام این عملیات باید وارد شده باشید.",
                variant: "destructive",
                className: 'font-body',
            });
            return;
        }
        setIsLoading(true);

        try {
            if (isEditMode && announcement) {
                const announcementRef = doc(firestore, 'announcements', announcement.id);
                updateDocumentNonBlocking(announcementRef, { content: data.content, timestamp: serverTimestamp() });
                 toast({
                    title: "اطلاعیه به‌روزرسانی شد",
                    description: "تغییرات با موفقیت ذخیره شد.",
                    className: 'font-body',
                });
            } else {
                const announcementData = {
                    teacherId: user.uid,
                    content: data.content,
                    timestamp: serverTimestamp(),
                };
                const announcementsCol = collection(firestore, 'announcements');
                const newDocRef = doc(announcementsCol);
                setDocumentNonBlocking(newDocRef, { ...announcementData, id: newDocRef.id }, {});
                
                toast({
                    title: "اطلاعیه منتشر شد",
                    description: "اطلاعیه شما در صفحه اصلی نمایش داده خواهد شد.",
                    className: 'font-body',
                });
            }
            onSuccess();
            form.reset();

        } catch (error: any) {
            console.error("Error saving announcement:", error);
            toast({
                title: "خطا در ذخیره‌سازی",
                description: error.message || "مشکلی در هنگام ذخیره اطلاعیه پیش آمد.",
                variant: "destructive",
                className: 'font-body',
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
                            <FormLabel>متن اطلاعیه</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="پیام خود را در اینجا بنویسید..."
                                    className="min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="ml-2 h-4 w-4" />
                        )}
                        {isEditMode ? 'ذخیره تغییرات' : 'انتشار اطلاعیه'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
