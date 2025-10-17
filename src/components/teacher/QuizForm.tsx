'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Save, PlusCircle, Trash2, Timer, Lock, Unlock } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import type { Quiz } from '@/lib/types';
import { Switch } from '../ui/switch';


const quizQuestionSchema = z.object({
    questionText: z.string().min(1, 'متن سوال الزامی است.'),
    options: z.array(z.string().min(1, 'متن گزینه الزامی است.')).length(4, 'باید دقیقاً ۴ گزینه وجود داشته باشد.'),
    correctAnswerIndex: z.coerce.number().min(0).max(3),
    duration: z.coerce.number().min(0).optional(),
});

const formSchema = z.object({
  title: z.string().min(3, "عنوان آزمون باید حداقل ۳ کاراکتر باشد."),
  duration: z.coerce.number().min(0).optional(),
  allowBackNavigation: z.boolean().default(true),
  questions: z.array(quizQuestionSchema).min(1, 'آزمون باید حداقل یک سوال داشته باشد.'),
});

type FormValues = z.infer<typeof formSchema>;

interface QuizFormProps {
  quiz?: Quiz;
  onSuccess: () => void;
}

export function QuizForm({ quiz, onSuccess }: QuizFormProps) {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!quiz;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
        title: quiz.title,
        duration: quiz.duration,
        allowBackNavigation: quiz.allowBackNavigation,
        questions: quiz.questions.map(q => ({
            ...q,
            correctAnswerIndex: Number(q.correctAnswerIndex),
            duration: q.duration || 0,
        }))
    } : {
      title: '',
      duration: 0,
      allowBackNavigation: true,
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, duration: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(data: FormValues) {
    if (!user) {
      toast({ title: "خطا", description: "برای انجام این عملیات باید وارد شده باشید.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const quizData = {
        teacherId: user.uid,
        title: data.title,
        duration: data.duration,
        allowBackNavigation: data.allowBackNavigation,
        questions: data.questions.map(q => ({
            ...q,
            correctAnswerIndex: Number(q.correctAnswerIndex)
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }

    try {
        if (isEditMode && quiz) {
            const quizRef = doc(firestore, 'teachers', user.uid, 'quizzes', quiz.id);
            updateDocumentNonBlocking(quizRef, { ...quizData, createdAt: quiz.createdAt });
            toast({ title: 'آزمون به‌روزرسانی شد', description: 'تغییرات با موفقیت ذخیره شد.' });
        } else {
            const quizzesCol = collection(firestore, 'teachers', user.uid, 'quizzes');
            const newDocRef = doc(quizzesCol);
            setDocumentNonBlocking(newDocRef, { ...quizData, id: newDocRef.id }, {});
            toast({ title: 'آزمون ایجاد شد', description: 'آزمون جدید با موفقیت ساخته شد.' });
        }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast({ title: 'خطا در ذخیره‌سازی', description: error.message || 'مشکلی در هنگام ذخیره آزمون پیش آمد.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                  <FormLabel>عنوان آزمون</FormLabel>
                  <FormControl><Input placeholder="مثال: آزمون فصل اول فیزیک دهم" {...field} /></FormControl>
                  <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Timer className="h-4 w-4"/>
                      زمان کلی آزمون (دقیقه)
                    </FormLabel>
                    <FormControl><Input type="number" placeholder="مثال: 25" {...field} /></FormControl>
                    <FormDescription className="text-xs">برای آزمون بدون زمان کلی، این فیلد را خالی یا 0 بگذارید.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        
        <FormField control={form.control} name="allowBackNavigation" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 text-sm">
                      {field.value ? <Unlock className="h-4 w-4"/> : <Lock className="h-4 w-4"/>}
                      امکان بازگشت به سوالات قبل
                    </FormLabel>
                    <FormDescription className="text-xs">
                        {field.value ? 'دانش‌آموز می‌تواند بین سوالات جابجا شود.' : 'دانش‌آموز نمی‌تواند به سوالات قبلی بازگردد.'}
                    </FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
        )} />
        
        <div className="space-y-4">
            <FormLabel>سوالات آزمون</FormLabel>
            {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-md border p-4 relative bg-muted/50">
                    <div className='flex justify-between items-center'>
                        <h4 className="font-semibold text-sm">سوال {index + 1}</h4>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    <FormField control={form.control} name={`questions.${index}.questionText`} render={({ field }) => (
                        <FormItem><FormLabel>متن سوال</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <FormField control={form.control} name={`questions.${index}.correctAnswerIndex`} render={({ field: radioField }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>گزینه‌ها (پاسخ صحیح را انتخاب کنید)</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(val) => radioField.onChange(parseInt(val, 10))} defaultValue={String(radioField.value)} className="space-y-2">
                                {[0, 1, 2, 3].map((optIndex) => (
                                    <FormField key={optIndex} control={form.control} name={`questions.${index}.options.${optIndex}`} render={({ field }) => (
                                        <FormItem className="flex items-center space-x-3 space-y-0 gap-2">
                                            <FormControl>
                                                <RadioGroupItem value={String(optIndex)} />
                                            </FormControl>
                                            <FormControl>
                                                <Input placeholder={`گزینه ${optIndex + 1}`} {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name={`questions.${index}.duration`} render={({ field }) => (
                        <FormItem className="max-w-xs">
                            <FormLabel className="text-xs">زمان این سوال (ثانیه)</FormLabel>
                            <FormControl><Input type="number" placeholder="اختیاری" {...field} /></FormControl>
                            <FormDescription className="text-xs">برای زمان‌بندی مجزا، این فیلد را پر کنید.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center">
             <Button type="button" variant="outline" size="sm" onClick={() => append({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, duration: 0 })}>
                <PlusCircle className="ml-2 h-4 w-4" /> افزودن سوال
            </Button>
             <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                {isEditMode ? 'ذخیره تغییرات' : 'ایجاد آزمون'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
