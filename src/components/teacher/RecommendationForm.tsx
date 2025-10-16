'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Send, PlusCircle, Trash2, FileQuestion } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const quizQuestionSchema = z.object({
    questionText: z.string().min(1, 'متن سوال الزامی است.'),
    options: z.array(z.string().min(1, 'متن گزینه الزامی است.')).length(4, 'باید دقیقاً ۴ گزینه وجود داشته باشد.'),
    correctAnswerIndex: z.coerce.number().min(0).max(3),
});

const formSchema = z.object({
  content: z.string().min(10, 'متن توصیه باید حداقل ۱۰ کاراکتر باشد.'),
  isBlocking: z.boolean().default(false),
  hasQuiz: z.boolean().default(false),
  quiz: z.object({
    title: z.string().optional(),
    questions: z.array(quizQuestionSchema).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecommendationFormProps {
  studentId: string;
}

export function RecommendationForm({ studentId }: RecommendationFormProps) {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      isBlocking: false,
      hasQuiz: false,
      quiz: {
        title: '',
        questions: [],
      }
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "quiz.questions",
  });

  const watchHasQuiz = form.watch('hasQuiz');

  async function onSubmit(data: FormValues) {
    if (!user) {
      toast({ title: "خطا", description: "برای انجام این عملیات باید وارد شده باشید.", variant: "destructive" });
      return;
    }
    
    if (data.hasQuiz && (!data.quiz?.title || data.quiz.questions?.length === 0)) {
        toast({ title: "خطا در آزمون", description: "برای افزودن آزمون، باید حداقل یک عنوان و یک سوال تعریف کنید.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    try {
      const recommendationsCol = collection(firestore, 'teachers', user.uid, 'students', studentId, 'recommendations');
      const newDocRef = doc(recommendationsCol);

      const recommendationData: any = {
        id: newDocRef.id,
        studentId,
        teacherId: user.uid,
        content: data.content,
        isBlocking: data.isBlocking,
        isRead: false,
        createdAt: serverTimestamp(),
      };

      if (data.hasQuiz) {
          recommendationData.quiz = data.quiz;
      }
      
      setDocumentNonBlocking(newDocRef, recommendationData, {});
      
      toast({ title: 'توصیه ارسال شد', description: 'توصیه شما با موفقیت برای دانش‌آموز ارسال شد.' });
      
      form.reset({ content: '', isBlocking: false, hasQuiz: false, quiz: { title: '', questions: [] } });

    } catch (error: any) {
      console.error('Error sending recommendation:', error);
      toast({ title: 'خطا در ارسال', description: error.message || 'مشکلی در هنگام ارسال توصیه پیش آمد.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="content" render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">متن توصیه</FormLabel>
              <FormControl>
                <Textarea placeholder="توصیه خود را در اینجا بنویسید..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
        )} />
        
        <FormField control={form.control} name="isBlocking" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="isBlockingSwitch">قفل کردن گزارش کار</Label>
                    <FormDescription className='text-xs'>تا زمان خواندن این توصیه، دانش‌آموز نتواند گزارش ثبت کند.</FormDescription>
                </div>
                <FormControl><Switch id="isBlockingSwitch" checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
        )} />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
             <FormField control={form.control} name="hasQuiz" render={({ field }) => (
                <AccordionTrigger className="w-full rounded-lg border p-3 shadow-sm hover:no-underline">
                     <div className="flex flex-row items-center justify-between w-full">
                        <div className="space-y-0.5 text-right">
                           <Label htmlFor="hasQuizSwitch">افزودن آزمون به توصیه</Label>
                            <FormDescription className='text-xs'>برای اطمینان از درک مطلب، یک آزمون کوتاه اضافه کنید.</FormDescription>
                        </div>
                        <FormControl><Switch id="hasQuizSwitch" checked={field.value} onCheckedChange={field.onChange} onClick={(e) => e.stopPropagation()} /></FormControl>
                    </div>
                </AccordionTrigger>
              )} />
            <AccordionContent className="pt-4">
                {watchHasQuiz && (
                    <div className="space-y-4 rounded-md border bg-muted/50 p-4">
                         <FormField control={form.control} name="quiz.title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>عنوان آزمون</FormLabel>
                                <FormControl><Input placeholder="مثال: آزمون درک مطلب توصیه" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {fields.map((field, index) => (
                          <div key={field.id} className="space-y-3 rounded-md border p-3 relative bg-background">
                            <h4 className="font-semibold text-sm">سوال {index + 1}</h4>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 left-1 h-6 w-6" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <FormField control={form.control} name={`quiz.questions.${index}.questionText`} render={({ field }) => (
                                <FormItem><FormLabel>متن سوال</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            <FormField control={form.control} name={`quiz.questions.${index}.correctAnswerIndex`} render={({ field: radioField }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>گزینه‌ها (گزینه صحیح را انتخاب کنید)</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={(val) => radioField.onChange(parseInt(val))} defaultValue={String(radioField.value)} className="space-y-2">
                                        {[0, 1, 2, 3].map((optIndex) => (
                                            <FormField key={optIndex} control={form.control} name={`quiz.questions.${index}.options.${optIndex}`} render={({ field }) => (
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
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 })}>
                            <PlusCircle className="ml-2 h-4 w-4" /> افزودن سوال
                        </Button>
                    </div>
                )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>


        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
            ارسال توصیه
          </Button>
        </div>
      </form>
    </Form>
  );
}
