'use client';

import { Lightbulb, CheckCircle, FileQuestion, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import type { StudentRecommendation } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface StudentRecommendationCardProps {
  recommendation: StudentRecommendation;
}

const QuizForm = ({ recommendation }: { recommendation: StudentRecommendation }) => {
  const { toast } = useToast();
  const { firestore, user, role } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const teacherId = role?.split(':')[1];
  
  const defaultValues = recommendation.quiz?.questions.reduce((acc, _, index) => {
    acc[`question_${index}`] = '';
    return acc;
  }, {} as Record<string, string>);

  const methods = useForm({ defaultValues });

  const checkAnswers = (data: Record<string, string>) => {
     if (!recommendation.quiz) return;
     setIsLoading(true);

    const isCorrect = recommendation.quiz.questions.every((q, index) => {
        const selectedAnswer = parseInt(data[`question_${index}`], 10);
        return selectedAnswer === q.correctAnswerIndex;
    });

    if (isCorrect) {
        if (!user || !teacherId) return;
        const recommendationRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'recommendations', recommendation.id);
        updateDocumentNonBlocking(recommendationRef, { isRead: true, readAt: serverTimestamp() });
        toast({ title: 'آزمون موفقیت‌آمیز بود!', description: 'توصیه به عنوان خوانده شده علامت‌گذاری شد و قفل گزارش کار برداشته شد.' });
    } else {
        toast({ title: 'پاسخ‌ها صحیح نیست', description: 'لطفاً دوباره توصیه را مطالعه کرده و با دقت به سوالات پاسخ دهید.', variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  return (
    <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(checkAnswers)} className="space-y-6 mt-4">
            <CardHeader className="p-0">
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    {recommendation.quiz?.title || "آزمون درک مطلب"}
                </CardTitle>
                <CardDescription>برای تایید مطالعه، لطفا به سوالات زیر پاسخ دهید.</CardDescription>
            </CardHeader>
            <div className="space-y-6">
                {recommendation.quiz?.questions.map((q, qIndex) => (
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
                                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                                </>
                            )}
                        />
                    </div>
                ))}
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle className="ml-2 h-4 w-4" />}
                اتمام آزمون و ثبت
            </Button>
        </form>
    </FormProvider>
  )
}


export function StudentRecommendationCard({ recommendation }: StudentRecommendationCardProps) {
  const { firestore, user, role } = useFirebase();
  const { toast } = useToast();
  const teacherId = role?.split(':')[1];

  const handleMarkAsRead = () => {
    if (!user || !teacherId) return;

    const recommendationRef = doc(firestore, 'teachers', teacherId, 'students', user.uid, 'recommendations', recommendation.id);
    updateDocumentNonBlocking(recommendationRef, { isRead: true, readAt: serverTimestamp() });
    toast({ title: 'توصیه مطالعه شد', description: 'این توصیه به عنوان خوانده شده علامت‌گذاری شد.' });
  };

  const hasQuiz = recommendation.quiz && recommendation.quiz.questions && recommendation.quiz.questions.length > 0;

  return (
    <Card className="border-primary/30 bg-primary/5 animate-fade-in-up">
      <CardHeader>
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Lightbulb className="h-6 w-6" />
            </div>
            <div className="flex-1">
                <CardTitle className="font-headline text-lg">توصیه جدید از طرف مشاور</CardTitle>
                 <CardDescription>
                    تاریخ ارسال: {new Date(recommendation.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed text-foreground/90">{recommendation.content}</p>
        
        {hasQuiz && (
            <div className="mt-6 border-t pt-6">
                <QuizForm recommendation={recommendation} />
            </div>
        )}

      </CardContent>
      {!hasQuiz && (
        <CardFooter>
            <Button onClick={handleMarkAsRead}>
            <CheckCircle className="ml-2 h-4 w-4" />
            خواندم و متوجه شدم
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
