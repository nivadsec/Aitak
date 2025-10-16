'use client';

import React from 'react';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import type { Quiz, QuizSubmission } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Percent, RefreshCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

function QuizTaker({ quiz }: { quiz: Quiz }) {
    const { toast } = useToast();
    const { firestore, user, role } = useFirebase();
    const teacherId = role?.split(':')[1];
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState<{ score: number; correct: number; total: number } | null>(null);

    const defaultValues = quiz.questions.reduce((acc, _, index) => {
        acc[`question_${index}`] = '';
        return acc;
    }, {} as Record<string, string>);

    const methods = useForm({ defaultValues });

    const onSubmit = (data: Record<string, string>) => {
        if (!user || !teacherId) return;
        setIsLoading(true);

        let correctAnswers = 0;
        const studentAnswers: number[] = [];

        quiz.questions.forEach((q, index) => {
            const selectedAnswer = parseInt(data[`question_${index}`], 10);
            studentAnswers.push(selectedAnswer);
            if (selectedAnswer === q.correctAnswerIndex) {
                correctAnswers++;
            }
        });
        
        const totalQuestions = quiz.questions.length;
        const score = (correctAnswers / totalQuestions) * 100;
        
        const submissionData: Omit<QuizSubmission, 'id'> = {
            quizId: quiz.id,
            studentId: user.uid,
            answers: studentAnswers,
            score: score,
            submittedAt: serverTimestamp(),
        }

        const submissionsCol = doc(firestore, 'teachers', teacherId, 'quizzes', quiz.id, 'submissions', user.uid);
        setDocumentNonBlocking(submissionsCol, submissionData, { merge: true });

        setResult({ score, correct: correctAnswers, total: totalQuestions });
        setIsLoading(false);
        toast({ title: "آزمون ثبت شد!", description: `شما به ${correctAnswers} سوال از ${totalQuestions} پاسخ صحیح دادید.` });
    };

    const handleRetry = () => {
        setResult(null);
        methods.reset(defaultValues);
    }

    if (result) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Percent className="h-6 w-6 text-primary" />
                        نتیجه آزمون: {quiz.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-5xl font-bold text-primary">{result.score.toFixed(0)}%</p>
                    <p className="text-muted-foreground">
                        شما به {result.correct} سوال از {result.total} سوال پاسخ صحیح دادید.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRetry} variant="outline">
                        <RefreshCcw className="ml-2 h-4 w-4" />
                        شرکت مجدد در آزمون
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
                        <CardDescription>به سوالات زیر با دقت پاسخ دهید.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {quiz.questions.map((q, qIndex) => (
                             <div key={qIndex} className="space-y-3 rounded-md border p-4">
                                <p className="font-medium">{qIndex + 1}. {q.questionText}</p>
                                <Controller
                                    name={`question_${qIndex}`}
                                    control={methods.control}
                                    rules={{ required: 'پاسخ به این سوال الزامی است.' }}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex items-center space-x-2 space-x-reverse">
                                                        <RadioGroupItem value={String(oIndex)} id={`q${qIndex}-o${oIndex}`} />
                                                        <Label htmlFor={`q${qIndex}-o${oIndex}`}>{opt}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            {fieldState.error && <p className="text-sm text-destructive mt-2">{fieldState.error.message}</p>}
                                        </>
                                    )}
                                />
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" size="lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle className="ml-2 h-4 w-4" />}
                            پایان و ثبت آزمون
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </FormProvider>
    );
}

export default function TakeQuizPage({ params }: { params: { id: string } }) {
    const { firestore, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const quizRef = useMemoFirebase(() => {
        if (!teacherId) return null;
        return doc(firestore, 'teachers', teacherId, 'quizzes', params.id);
    }, [firestore, teacherId, params.id]);

    const { data: quiz, isLoading } = useDoc<Quiz>(quizRef);

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
    
    if (!quiz) {
        return notFound();
    }

    return (
        <div className="max-w-3xl mx-auto">
            <QuizTaker quiz={quiz} />
        </div>
    );
}
