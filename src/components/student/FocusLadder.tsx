'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { BrainCircuit, Loader2, Check } from "lucide-react";
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const formSchema = z.object({
  intervalName: z.string().min(1, 'نام بازه الزامی است.'),
  startTime: z.string().min(1, 'زمان شروع الزامی است.'),
  endTime: z.string().min(1, 'زمان پایان الزامی است.'),
  duration: z.coerce.number().min(1, 'مدت زمان باید حداقل ۱ دقیقه باشد.'),
  score: z.number().min(0).max(10).default(7),
});

type FormValues = z.infer<typeof formSchema>;


export function FocusLadder() {
    const { toast } = useToast();
    const { firestore, user, role } = useFirebase();
    const [isLoading, setIsLoading] = React.useState(false);
    const [lastSubmission, setLastSubmission] = React.useState<string | null>(null);
    const teacherId = role?.split(':')[1];

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            intervalName: '',
            startTime: '',
            endTime: '',
            duration: 15,
            score: 7,
        },
    });

    async function onSubmit(data: FormValues) {
        if (!user || !teacherId) {
            toast({
                title: "خطا",
                description: "برای ثبت امتیاز تمرکز باید وارد شده باشید.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);

        try {
            const focusCol = collection(firestore, 'teachers', teacherId, 'students', user.uid, 'focusIntervals');
            const newDocRef = doc(focusCol);
            const focusData = {
                id: newDocRef.id,
                studentId: user.uid,
                ...data,
                timestamp: serverTimestamp(),
            };
            setDocumentNonBlocking(newDocRef, focusData, {});
            
            setLastSubmission(`بازه «${data.intervalName}» با تمرکز ${data.score} از ۱۰ ثبت شد.`);
            form.reset({ intervalName: '', startTime: '', endTime: '', duration: 15, score: 7 });

        } catch (error) {
            console.error("Error saving focus interval:", error);
            toast({
                title: "خطا در ثبت",
                description: "مشکلی در هنگام ذخیره امتیاز پیش آمد.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    نردبان تمرکز
                </CardTitle>
                <CardDescription>در پایان هر بازه مطالعه، میزان تمرکزت را بین ۰ تا ۱۰ انتخاب کن.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="intervalName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>نام بازه</FormLabel>
                                    <FormControl>
                                        <Input placeholder="مثال: فیزیک - بازه اول" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>شروع بازه</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>پایان بازه</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>مدت (دقیقه)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="score"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>امتیاز تمرکز: {field.value}</FormLabel>
                                    <FormControl>
                                        <Slider
                                            dir="ltr"
                                            value={[field.value]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            max={10}
                                            step={1}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <div className="flex flex-col items-start gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Check className="ml-2 h-4 w-4" />}
                                ثبت تمرکز
                            </Button>
                            {lastSubmission && (
                                <p className="text-sm text-green-600 animate-fade-in-up">{lastSubmission}</p>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
