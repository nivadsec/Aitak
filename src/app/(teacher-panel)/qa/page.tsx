'use client';

import React, { useMemo, useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { QuestionAnswer, Student, Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Send, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

function ChatInterface({ student, questions, teacher }: { student: Student; questions: QuestionAnswer[], teacher: any }) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [answer, setAnswer] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    const studentQuestions = useMemo(() => {
        return questions
            .filter(q => q.studentId === student.id)
            .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    }, [questions, student.id]);

    React.useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [studentQuestions]);


    const handleAnswer = (question: QuestionAnswer) => {
        if (!user || !answer.trim()) return;
        setIsSending(true);

        const questionRef = doc(firestore, 'teachers', user.uid, 'questions', question.id);
        updateDocumentNonBlocking(questionRef, {
            answer: answer,
            isAnswered: true,
            answeredAt: serverTimestamp()
        });
        
        toast({ title: 'پاسخ ارسال شد' });
        setIsSending(false);
        setAnswer('');
    };
    
    // The last unanswered question for this student
    const lastUnansweredQuestion = [...studentQuestions].reverse().find(q => !q.isAnswered);


    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-row items-center gap-3 border-b p-4">
                 <Avatar>
                    <AvatarImage src={student.avatarUrl} />
                    <AvatarFallback>{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base font-headline">{student.firstName} {student.lastName}</CardTitle>
                </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
                 <div className="space-y-6">
                    {studentQuestions.flatMap((q, index) => {
                        const messages = [];
                        // Question
                        messages.push(
                            <div key={`q-${index}`} className="flex items-end gap-3 justify-start">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={student.avatarUrl} />
                                    <AvatarFallback>{student.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="rounded-xl bg-muted p-3 max-w-lg">
                                    <p className="text-sm">{q.question}</p>
                                    <p className="text-xs text-muted-foreground mt-1 text-left">{q.createdAt ? new Date(q.createdAt.seconds * 1000).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                </div>
                            </div>
                        );
                        // Answer
                        if (q.isAnswered && q.answer) {
                            messages.push(
                                <div key={`a-${index}`} className="flex items-end gap-3 justify-end">
                                    <div className="rounded-xl bg-primary text-primary-foreground p-3 max-w-lg">
                                        <p className="text-sm">{q.answer}</p>
                                        <p className="text-xs text-primary-foreground/70 mt-1 text-left">{q.answeredAt ? new Date(q.answeredAt.seconds * 1000).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                    </div>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={teacher?.photoURL} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                </div>
                            );
                        }
                        return messages;
                    })}
                 </div>
            </ScrollArea>
            {lastUnansweredQuestion && (
                 <div className="p-4 border-t bg-background/95">
                     <p className='text-xs text-muted-foreground mb-2'>پاسخ به آخرین سوال دانش‌آموز:</p>
                     <div className="flex w-full items-center space-x-2 space-x-reverse">
                        <Input
                            placeholder="پاسخ خود را بنویسید..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAnswer(lastUnansweredQuestion)}
                            disabled={isSending}
                        />
                        <Button onClick={() => handleAnswer(lastUnansweredQuestion)} disabled={isSending || !answer.trim()}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">ارسال</span>
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}

export default function TeacherQAPage() {
    const { firestore, user } = useFirebase();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

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

    const conversations = useMemo(() => {
        if (!questions || !students) return [];
        
        const studentMap = new Map(students.map(s => [s.id, s]));
        const convos = new Map<string, { student: Student, lastQuestion: QuestionAnswer, unreadCount: number }>();

        for (const q of questions) {
            if (!convos.has(q.studentId)) {
                const student = studentMap.get(q.studentId);
                if (student) {
                    convos.set(q.studentId, {
                        student,
                        lastQuestion: q,
                        unreadCount: 0
                    });
                }
            }
             const convo = convos.get(q.studentId);
             if (convo && !q.isAnswered) {
                 convo.unreadCount++;
             }
        }
        return Array.from(convos.values());

    }, [questions, students]);
    
    // Select the first student with an unread message on initial load
    React.useEffect(() => {
        if (!selectedStudentId && conversations.length > 0) {
            const firstUnread = conversations.find(c => c.unreadCount > 0);
            setSelectedStudentId(firstUnread ? firstUnread.student.id : conversations[0].student.id);
        }
    }, [conversations, selectedStudentId]);

    const selectedStudent = useMemo(() => {
        if (!selectedStudentId || !students) return null;
        return students.find(s => s.id === selectedStudentId) || null;
    }, [selectedStudentId, students]);

    const isLoading = areQuestionsLoading || areStudentsLoading;

    return (
        <div className="h-[calc(100vh-6rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-6">
                <Card className="lg:col-span-1 h-full flex flex-col">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><HelpCircle /> گفتگوها</CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <CardContent className="p-2">
                             {isLoading && <Skeleton className="h-64 w-full" />}
                             {!isLoading && conversations.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">هنوز گفتگویی وجود ندارد.</p>}
                             <div className="space-y-2">
                                {conversations.map(({ student, lastQuestion, unreadCount }) => (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudentId(student.id)}
                                        className={cn(
                                            "w-full text-right p-3 rounded-lg flex items-center gap-3 transition-colors",
                                            selectedStudentId === student.id ? "bg-muted" : "hover:bg-muted/50"
                                        )}
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={student.avatarUrl} />
                                            <AvatarFallback>{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate">{student.firstName} {student.lastName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{lastQuestion.isAnswered ? "شما: " : ""}{lastQuestion.question}</p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <div className="flex-shrink-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {unreadCount}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </ScrollArea>
                </Card>

                <div className="lg:col-span-3 h-full">
                     {isLoading && <Skeleton className="h-full w-full" />}
                     {!isLoading && !selectedStudent && (
                         <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
                             <p className="text-muted-foreground">یک گفتگو را از لیست انتخاب کنید</p>
                         </div>
                     )}
                     {selectedStudent && (
                         <ChatInterface 
                            student={selectedStudent} 
                            questions={questions || []} 
                            teacher={user}
                         />
                     )}
                </div>
            </div>
        </div>
    );
}
