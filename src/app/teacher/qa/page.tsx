
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import type { QuestionAnswer, Student } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Send, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { serverTimestamp } from 'firebase/firestore';

function AnswerForm({ question }: { question: QuestionAnswer }) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [answer, setAnswer] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAnswer = () => {
        if (!user || !answer.trim()) return;
        setIsLoading(true);

        const questionRef = doc(firestore, 'teachers', user.uid, 'questions', question.id);
        updateDocumentNonBlocking(questionRef, {
            answer: answer,
            isAnswered: true,
            answeredAt: serverTimestamp()
        });

        toast({ title: 'پاسخ ارسال شد' });
        setIsLoading(false);
        setAnswer('');
    };

    return (
        <div className="mt-4 space-y-2">
            <Textarea 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="پاسخ خود را اینجا بنویسید..." 
            />
            <Button onClick={handleAnswer} disabled={isLoading || !answer.trim()}>
                <Send className="ml-2 h-4 w-4" />
                ارسال پاسخ
            </Button>
        </div>
    );
}

export default function TeacherQAPage() {
    const { firestore, user } = useFirebase();

    const questionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'questions'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const studentsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'students'));
    }, [firestore, user]);

    const { data: questions, isLoading: areQuestionsLoading } = useCollection<QuestionAnswer>(questionsQuery);
    const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);

    const studentsMap = React.useMemo(() => {
        if (!students) return new Map();
        return new Map(students.map(s => [s.id, s]));
    }, [students]);

    const unansweredQuestions = React.useMemo(() => questions?.filter(q => !q.isAnswered) || [], [questions]);
    const answeredQuestions = React.useMemo(() => questions?.filter(q => q.isAnswered) || [], [questions]);

    const isLoading = areQuestionsLoading || areStudentsLoading;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <HelpCircle />
                        مدیریت پرسش و پاسخ
                    </CardTitle>
                    <CardDescription>
                        به سوالات ارسال شده توسط دانش‌آموزان پاسخ دهید.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <Skeleton className="h-48 w-full" />
                    ) : (
                         <Accordion type="multiple" defaultValue={['unanswered']} className="w-full">
                            <AccordionItem value="unanswered">
                                <AccordionTrigger className="font-headline text-lg">سوالات پاسخ داده نشده ({unansweredQuestions.length})</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                    {unansweredQuestions.length > 0 ? unansweredQuestions.map(q => {
                                        const student = studentsMap.get(q.studentId);
                                        return (
                                            <Card key={q.id} className="bg-primary/5">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={student?.avatarUrl} />
                                                                <AvatarFallback>{student?.firstName?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold">{student?.firstName} {student?.lastName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    پرسیده شده در: {new Date(q.createdAt?.seconds * 1000).toLocaleString('fa-IR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="font-medium mb-4">{q.question}</p>
                                                    <AnswerForm question={q} />
                                                </CardContent>
                                            </Card>
                                        )
                                    }) : <p className="text-muted-foreground text-center p-4">سوالی برای پاسخ دادن وجود ندارد.</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="answered">
                                <AccordionTrigger className="font-headline text-lg">سوالات پاسخ داده شده ({answeredQuestions.length})</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                     {answeredQuestions.length > 0 ? answeredQuestions.map(q => {
                                        const student = studentsMap.get(q.studentId);
                                        return (
                                            <Card key={q.id} className="bg-muted/50">
                                                 <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={student?.avatarUrl} />
                                                                <AvatarFallback>{student?.firstName?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold">{student?.firstName} {student?.lastName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    پرسیده شده در: {new Date(q.createdAt?.seconds * 1000).toLocaleString('fa-IR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                         <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />پاسخ داده شده</span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="font-medium">{q.question}</p>
                                                    <div className="mt-4 p-3 rounded-md bg-background border">
                                                        <p className="font-semibold text-sm">پاسخ شما:</p>
                                                        <p className="text-sm text-muted-foreground">{q.answer}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    }) : <p className="text-muted-foreground text-center p-4">هنوز به سوالی پاسخ داده نشده است.</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
