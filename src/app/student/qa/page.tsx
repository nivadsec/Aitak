'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCollection, useFirebase, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, where } from 'firebase/firestore';
import type { QuestionAnswer, Student, Teacher } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Send, Loader2, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDoc } from '@/firebase/firestore/use-doc';

export default function StudentQAPage() {
    const { firestore, user, role } = useFirebase();
    const { toast } = useToast();
    const [newQuestion, setNewQuestion] = useState('');
    const [isSending, setIsSending] = useState(false);
    const teacherId = role?.split(':')[1];
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const questionsQuery = useMemoFirebase(() => {
        if (!user || !teacherId) return null;
        return query(collection(firestore, 'teachers', teacherId, 'questions'), where('studentId', '==', user.uid), orderBy('createdAt', 'asc'));
    }, [firestore, user, teacherId]);

     const teacherRef = useMemoFirebase(() => {
        if (!teacherId) return null;
        return doc(firestore, 'teachers', teacherId);
    }, [firestore, teacherId]);

    const { data: questions, isLoading: areQuestionsLoading } = useCollection<QuestionAnswer>(questionsQuery);
    const { data: teacher, isLoading: isTeacherLoading } = useDoc<Teacher>(teacherRef);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [questions]);

    const handleAskQuestion = () => {
        if (!user || !teacherId || !newQuestion.trim()) return;
        setIsSending(true);

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
        setIsSending(false);
    };

    const isLoading = areQuestionsLoading || isTeacherLoading;

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto">
            <CardHeader className="px-0">
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <HelpCircle className="h-7 w-7 text-primary" />
                    گفتگو با معلم
                </CardTitle>
                <CardDescription>
                    سوالات درسی یا مشاوره‌ای خود را مستقیماً از معلم خود بپرسید.
                </CardDescription>
            </CardHeader>
            <Card className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-16 w-3/4" />
                                <Skeleton className="h-16 w-3/4 self-end" />
                                <Skeleton className="h-16 w-3/4" />
                            </>
                        ) : (
                            questions && questions.length > 0 ? (
                                questions.flatMap((q, index) => {
                                    const messages = [];
                                    // Question
                                    messages.push(
                                        <div key={`q-${index}`} className="flex items-end gap-3 justify-end">
                                            <div className="rounded-xl bg-primary text-primary-foreground p-3 max-w-lg">
                                                <p className="text-sm">{q.question}</p>
                                                <p className="text-xs text-primary-foreground/70 mt-1 text-left">{new Date(q.createdAt?.seconds * 1000).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user?.photoURL || undefined} />
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                        </div>
                                    );
                                    // Answer
                                    if (q.isAnswered && q.answer) {
                                        messages.push(
                                             <div key={`a-${index}`} className="flex items-end gap-3">
                                                 <Avatar className="h-9 w-9">
                                                    <AvatarFallback>{teacher?.firstName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="rounded-xl bg-muted p-3 max-w-lg">
                                                    <p className="text-sm">{q.answer}</p>
                                                     <p className="text-xs text-muted-foreground mt-1 text-left">{new Date(q.answeredAt?.seconds * 1000).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return messages;
                                })
                            ) : (
                                <div className="text-center text-muted-foreground p-8">
                                    هنوز گفتگویی شروع نشده است. اولین سوال خود را بپرسید!
                                </div>
                            )
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background/95">
                     <div className="flex w-full items-center space-x-2 space-x-reverse">
                        <Input
                            placeholder="سوال خود را اینجا بنویسید..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                            disabled={isSending}
                        />
                        <Button onClick={handleAskQuestion} disabled={isSending || !newQuestion.trim()}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">ارسال</span>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
