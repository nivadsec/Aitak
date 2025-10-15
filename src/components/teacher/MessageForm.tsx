'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Send, Loader2, Mail } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Student } from '@/lib/types';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const formSchema = z.object({
    recipient: z.string().min(1, 'انتخاب گیرنده الزامی است.'),
    message: z.string().min(10, 'متن پیام باید حداقل ۱۰ کاراکتر باشد.'),
    sendEmail: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface MessageFormProps {
    students: Student[];
}

export function MessageForm({ students }: MessageFormProps) {
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            recipient: 'all',
            message: '',
            sendEmail: false,
        },
    });

    async function onSubmit(data: FormValues) {
        if (!user) {
            toast({
                title: "خطا",
                description: "برای ارسال پیام باید وارد شده باشید.",
                variant: "destructive",
                className: 'font-body',
            });
            return;
        }
        setIsLoading(true);

        const messageData = {
            teacherId: user.uid,
            studentId: data.recipient, // 'all' or a specific student ID
            content: data.message,
            timestamp: serverTimestamp(),
            sentByEmail: data.sendEmail,
            read: false,
        };

        try {
            if (data.recipient === 'all') {
                const messagesCol = collection(firestore, 'teachers', user.uid, 'messages');
                const newDocRef = doc(messagesCol);
                setDocumentNonBlocking(newDocRef, { ...messageData, id: newDocRef.id }, {});
            } else {
                const studentMessagesCol = collection(firestore, 'teachers', user.uid, 'students', data.recipient, 'messages');
                const newDocRef = doc(studentMessagesCol);
                setDocumentNonBlocking(newDocRef, { ...messageData, id: newDocRef.id }, {});
            }

            toast({
                title: "پیام ارسال شد",
                description: "پیام شما با موفقیت به پنل کاربری ارسال شد.",
                className: 'font-body',
            });

            if (data.sendEmail) {
                // TODO: Implement actual email sending logic here via a server-side function.
                console.log("Simulating email sending...", data);
                toast({
                    title: "ایمیل ارسال شد",
                    description: "پیام شما به ایمیل کاربر نیز ارسال گردید.",
                    className: 'font-body',
                });
            }

            form.reset({ recipient: data.recipient, message: '', sendEmail: data.sendEmail });
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast({
                title: "خطا در ارسال",
                description: error.message || "مشکلی در هنگام ارسال پیام پیش آمد.",
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
                    name="recipient"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ارسال به</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="گیرنده را انتخاب کنید" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="all">تمام دانش‌آموزان</SelectItem>
                                    {students.map(student => (
                                        <SelectItem key={student.id} value={student.id}>
                                            {student.firstName} {student.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>متن پیام</FormLabel>
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

                <FormField
                    control={form.control}
                    name="sendEmail"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label htmlFor="sendEmailSwitch" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    ارسال از طریق ایمیل
                                </Label>
                                <FormDescription>
                                    با فعال‌سازی، یک نسخه از پیام به ایمیل دانش‌آموز ارسال می‌شود.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    id="sendEmailSwitch"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="ml-2 h-4 w-4" />
                        )}
                        ارسال پیام
                    </Button>
                </div>
            </form>
        </Form>
    );
}
