'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import type { Test, TestSubmission } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Percent, RefreshCcw, Timer, ArrowLeft, ArrowRight, FileDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Progress } from '@/components/ui/progress';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TestTaker = ({ test }: { test: Test }) => {
    const { toast } = useToast();
    const { firestore, user, role } = useFirebase();
    const teacherId = role?.split(':')[1];
    const router = useRouter();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(() => Array(test.questions.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [overallTimeLeft, setOverallTimeLeft] = useState(test.duration ? test.duration * 60 : null);
    const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);

    const currentQuestion = test.questions[currentQuestionIndex];

    const goToNextQuestion = useCallback(() => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    }, [currentQuestionIndex, test.questions.length]);

    useEffect(() => {
        setQuestionTimeLeft(currentQuestion.duration || null);
        
        if (currentQuestion.duration) {
            const timerId = setInterval(() => {
                setQuestionTimeLeft(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(timerId);
                        goToNextQuestion();
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [currentQuestion, goToNextQuestion]);
    
    useEffect(() => {
        if (overallTimeLeft === null || isFinished) return;

        if (overallTimeLeft <= 0) {
            toast({ title: "وقت تمام شد!", description: "آزمون شما به صورت خودکار ثبت می‌شود.", variant: 'destructive' });
            handleSubmit();
            return;
        }

        const timerId = setInterval(() => setOverallTimeLeft(prev => (prev ? prev - 1 : 0)), 1000);
        return () => clearInterval(timerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overallTimeLeft, isFinished]);

    const handleAnswerChange = (value: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = parseInt(value, 10);
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (!user || !teacherId) return;
        setIsLoading(true);
        setIsFinished(true);

        let correctAnswers = 0;
        test.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswerIndex) {
                correctAnswers++;
            }
        });
        
        const totalQuestions = test.questions.length;
        const score = (correctAnswers / totalQuestions) * 100;
        
        const submissionData: Omit<TestSubmission, 'id'> = {
            testId: test.id,
            studentId: user.uid,
            answers: answers as (number | null)[],
            score: score,
            submittedAt: serverTimestamp(),
        }

        const submissionRef = doc(firestore, 'teachers', teacherId, 'tests', test.id, 'submissions', user.uid);
        await setDocumentNonBlocking(submissionRef, submissionData, { merge: true });

        setResult({ score, correct: correctAnswers, total: totalQuestions });
        setIsLoading(false);
        toast({ title: "آزمون ثبت شد!", description: `شما به ${correctAnswers} سوال از ${totalQuestions} پاسخ صحیح دادید.` });
    };

    const handleRetry = () => {
        setResult(null);
        setIsFinished(false);
        setCurrentQuestionIndex(0);
        setAnswers(Array(test.questions.length).fill(null));
        setOverallTimeLeft(test.duration ? test.duration * 60 : null);
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        doc.setLanguage('fa');
        doc.text(test.title, 105, 20, { align: 'center' });
        
        (doc as any).autoTable({
            startY: 30,
            head: [['سوال', 'گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴', 'پاسخ صحیح']],
            body: test.questions.map((q, i) => [
                `${i + 1}. ${q.questionText}`,
                q.options[0],
                q.options[1],
                q.options[2],
                q.options[3],
                q.correctAnswerIndex + 1,
            ]),
            styles: { font: "Arial", halign: 'right' },
            headStyles: { halign: 'center', fillColor: [116, 188, 198] },
        });

        doc.save(`${test.title}.pdf`);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (result) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><Percent className="h-6 w-6 text-primary" />نتیجه آزمون: {test.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-5xl font-bold text-primary">{result.score.toFixed(0)}%</p>
                    <p className="text-muted-foreground">شما به {result.correct} سوال از {result.total} پاسخ صحیح دادید.</p>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-2">
                    <Button onClick={handleRetry} variant="outline"><RefreshCcw className="ml-2 h-4 w-4" />شرکت مجدد</Button>
                    <Button onClick={() => router.push('/student/tests')}>بازگشت به لیست</Button>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle className="font-headline text-2xl">{test.title}</CardTitle>
                            <CardDescription>سوال {currentQuestionIndex + 1} از {test.questions.length}</CardDescription>
                        </div>
                        <div className='flex gap-4 items-center'>
                           <Button variant="outline" size="sm" onClick={handleDownloadPdf}><FileDown className="ml-2 h-4 w-4" />PDF</Button>
                            {overallTimeLeft !== null && test.duration && (
                                <div className="text-center space-y-1">
                                    <div className="flex items-center justify-center gap-2 text-sm font-mono font-semibold rounded-md border p-2 bg-muted">
                                        <Timer className="h-4 w-4 text-primary"/>
                                        <span>{formatTime(overallTimeLeft)}</span>
                                    </div>
                                    <Label className="text-xs text-muted-foreground">زمان کل</Label>
                                </div>
                            )}
                             {questionTimeLeft !== null && currentQuestion.duration && (
                                <div className="text-center space-y-1">
                                     <div className="flex items-center justify-center gap-2 text-sm font-mono font-semibold rounded-md border p-2 bg-muted">
                                        <Timer className="h-4 w-4 text-destructive"/>
                                        <span>{formatTime(questionTimeLeft)}</span>
                                    </div>
                                    <Label className="text-xs text-muted-foreground">زمان سوال</Label>
                                </div>
                            )}
                        </div>
                    </div>
                     <Progress value={((currentQuestionIndex + 1) / test.questions.length) * 100} className="mt-4 h-2" />
                </CardHeader>
                <CardContent className="space-y-8 min-h-[300px]">
                    <div className="space-y-3">
                        <p className="font-medium text-lg">{currentQuestionIndex + 1}. {currentQuestion.questionText}</p>
                        <RadioGroup onValueChange={handleAnswerChange} value={String(answers[currentQuestionIndex])} className="space-y-3 pt-4">
                            {currentQuestion.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-2 space-x-reverse rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value={String(oIndex)} id={`q${currentQuestionIndex}-o${oIndex}`} />
                                    <Label htmlFor={`q${currentQuestionIndex}-o${oIndex}`} className="flex-1 cursor-pointer">{opt}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0 || !test.allowBackNavigation}>
                        <ArrowRight className="ml-2 h-4 w-4" /> سوال قبل
                    </Button>
                    {currentQuestionIndex === test.questions.length - 1 ? (
                        <Button size="lg" disabled={isLoading} onClick={handleSubmit}>
                            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle className="ml-2 h-4 w-4" />}
                            پایان و ثبت
                        </Button>
                    ) : (
                        <Button onClick={goToNextQuestion}>
                            سوال بعد <ArrowLeft className="mr-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default function TakeTestPage({ params }: { params: { id: string } }) {
    const { firestore, role } = useFirebase();
    const router = useRouter();
    const { id } = params;

    const testRef = useMemoFirebase(() => {
        if (!role || !id) return null;
        const teacherId = role.split(':')[1];
        return doc(firestore, 'teachers', teacherId, 'tests', id);
    }, [firestore, role, id]);

    const { data: test, isLoading } = useDoc<Test>(testRef);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!test) {
        return notFound();
    }

    return (
        <div className="max-w-3xl mx-auto">
            <TestTaker test={test} />
        </div>
    );
}
