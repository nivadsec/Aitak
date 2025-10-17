
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, where } from 'firebase/firestore';
import type { QuestionAnswer } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Send, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function StudentQAPage() {
    const { firestore, user, role } = useFirebase();
    const { toast } = useToast();
    const [newQuestion, setNewQuestion] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const teacherId = role?.split(':')[1];

    const questionsQuery = useMemoFirebase(() => {
        if (!user || !teacherId) return null;
        return query(collection(firestore, 'teachers', teacherId, 'questions'), where('studentId', '==', user.uid), orderBy('createdAt', 'desc'));
    }, [firestore, user, teacherId]);

    const { data: questions, isLoading: areQuestionsLoading } = useCollection<QuestionAnswer>(questionsQuery);

    const handleAskQuestion = () => {
        if (!user || !teacherId || !newQuestion.trim()) return;
        setIsLoading(true);

        const questionsCol = collection(firestore, 'teachers', teacherId, 'questions');
        const newDocRef = doc(questionsCol);
        
        const questionData: Omit<QuestionAnswer, 'answer' | 'answeredAt'> = {
            id: newDocRef.id,
            studentId: user.uid,
            teacherId: teacherId,
            question: newQuestion,
            isAnswered: false,
            createdAt: serverTimestamp(),
        };

        setDocumentNonBlocking(newDocRef, questionData, {});
        
        toast({ title: 'سوال شما ارسال شد', description: 'معلم شما به زودی پاسخ خواهد داد.' });
        setNewQuestion('');
        setIsLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <HelpCircle />
                        پرسش و پاسخ با معلم
                    </CardTitle>
                    <CardDescription>
                        سوالات درسی یا مشاوره‌ای خود را مستقیماً از معلم خود بپرسید.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="سوال خود را اینجا بنویسید..." 
                        className="min-h-[100px]"
                    />
                    <Button onClick={handleAskQuestion} disabled={isLoading || !newQuestion.trim()}>
                        <Send className="ml-2 h-4 w-4" />
                        ارسال سوال
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">سوالات پیشین شما</CardTitle>
                </CardHeader>
                <CardContent>
                    {areQuestionsLoading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : (
                        questions && questions.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {questions.map(q => (
                                    <AccordionItem value={q.id} key={q.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between items-center w-full pr-4">
                                                <p className="truncate">{q.question}</p>
                                                {q.isAnswered ? (
                                                    <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />پاسخ داده شده</span>
                                                ) : (
                                                     <span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="h-3 w-3" />در انتظار پاسخ</span>
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <p className="font-semibold mb-2">سوال شما:</p>
                                            <p className="mb-4 text-muted-foreground">{q.question}</p>
                                            {q.isAnswered ? (
                                                <div className="p-3 rounded-md bg-muted/50">
                                                    <p className="font-semibold">پاسخ معلم:</p>
                                                    <p className="text-muted-foreground">{q.answer}</p>
                                                </div>
                                            ) : (
                                                <p className="text-center text-muted-foreground py-4">هنوز پاسخی برای این سوال ثبت نشده است.</p>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-muted-foreground text-center p-8">
                                هنوز سوالی نپرسیده‌اید.
                            </p>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
