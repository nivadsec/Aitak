'use client';

import { MessageForm } from '@/components/teacher/MessageForm';
import { RecommendationForm } from '@/components/teacher/RecommendationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, MessageSquare } from 'lucide-react';

export default function TeacherCommunicationPage() {
    const { firestore, user } = useFirebase();

    const studentsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'students'));
    }, [firestore, user]);

    const { data: students, isLoading } = useCollection(studentsQuery);

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <Lightbulb className="h-7 w-7 text-primary" />
                        مرکز ارتباطات
                    </CardTitle>
                    <CardDescription>
                        از اینجا می‌توانید برای دانش‌آموزان خود پیام یا توصیه‌های هوشمند ارسال کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="recommendation" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recommendation">
                        <Lightbulb className="ml-2 h-4 w-4" />
                        ارسال توصیه
                    </TabsTrigger>
                    <TabsTrigger value="message">
                        <MessageSquare className="ml-2 h-4 w-4" />
                        ارسال پیام
                    </TabsTrigger>
                </TabsList>

                {/* Recommendation Tab */}
                <TabsContent value="recommendation">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">ارسال توصیه جدید</CardTitle>
                            <CardDescription>
                                یک توصیه متنی برای دانش‌آموز ارسال کنید. می‌توانید گزارش کار او را تا زمان مطالعه توصیه قفل کرده و یا یک آزمون کوتاه برای اطمینان از درک مطلب اضافه کنید.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            ) : (
                                <RecommendationForm students={students || []} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Message Tab */}
                <TabsContent value="message">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">ارسال پیام</CardTitle>
                            <CardDescription>
                                به یک دانش‌آموز خاص یا همه دانش‌آموزان خود پیام متنی ارسال کنید.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            ) : (
                                <MessageForm students={students || []} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
