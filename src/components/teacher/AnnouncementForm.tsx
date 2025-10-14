'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Send, Loader2, Megaphone } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const formSchema = z.object({
    content: z.string().min(10, 'متن اطلاعیه باید حداقل ۱۰ کاراکتر باشد.'),
});

type FormValues = z.infer<typeof formSchema>;


export function AnnouncementForm() {
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
        },
    });

    async function onSubmit(data: FormValues) {
        if (!user) {
            toast({
                title: "خطا",
                description: "برای ارسال اطلاعیه باید وارد شده باشید.",
                variant: "destructive",
                className: 'font-body',
            });
            return;
        }
        setIsLoading(true);

        const announcementData = {
            teacherId: user.uid,
            content: data.content,
            timestamp: serverTimestamp(),
        };

        try {
            const announcementsCol = collection(firestore, 'announcements');
            const newDocRef = doc(announcementsCol);
            setDocumentNonBlocking(newDocRef, { ...announcementData, id: newDocRef.id }, {});
            
            toast({
                title: "اطلاعیه منتشر شد",
                description: "اطلاعیه شما در صفحه اصلی نمایش داده خواهد شد.",
                className: 'font-body',
            });
            form.reset();

        } catch (error: any) {
            console.error("Error sending announcement:", error);
            toast({
                title: "خطا در ارسال",
                description: error.message || "مشکلی در هنگام ارسال اطلاعیه پیش آمد.",
                variant: "destructive",
                className: 'font-body',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Megaphone />
                    ارسال اطلاعیه عمومی
                </CardTitle>
                <CardDescription>
                    این اطلاعیه برای همه کاربران در صفحه اصلی نمایش داده می‌شود.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                                انتشار اطلاعیه
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
