'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  CalendarIcon,
  Clock,
  FileUp,
  PlusCircle,
  Trash2,
  Save,
} from 'lucide-react';
import { format } from 'date-fns-jalali';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

const reportItemSchema = z.object({
  subject: z.string().min(1, 'درس الزامی است.'),
  topic: z.string().optional(),
  studyTime: z.coerce.number().min(0, 'زمان مطالعه نمی‌تواند منفی باشد.'),
  testCount: z.coerce.number().int().min(0, 'تعداد تست نمی‌تواند منفی باشد.'),
  correctCount: z.coerce.number().int().min(0, 'تعداد صحیح نمی‌تواند منفی باشد.'),
  wrongCount: z.coerce.number().int().min(0, 'تعداد غلط نمی‌تواند منفی باشد.'),
  testTime: z.coerce.number().min(0, 'زمان تست نمی‌تواند منفی باشد.'),
});

const formSchema = z.object({
  date: z.date({ required_error: 'تاریخ الزامی است.' }),
  wakeUpTime: z.string().optional(),
  studyStartTime: z.string().optional(),
  items: z.array(reportItemSchema),
  sleepHours: z.array(z.number()).default([8]),
  moodScore: z.array(z.number()).default([7]),
  mobileHours: z.array(z.number()).default([2]),
});

type FormValues = z.infer<typeof formSchema>;

export function DailyReportForm() {
    const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      items: [
        { subject: '', topic: '', studyTime: 0, testCount: 0, correctCount: 0, wrongCount: 0, testTime: 0 },
      ],
      sleepHours: [8],
      moodScore: [7],
      mobileHours: [2],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  function onSubmit(data: FormValues) {
    console.log(data);
    toast({
        title: "گزارش ثبت شد",
        description: "گزارش روزانه شما با موفقیت در سیستم ذخیره شد.",
        className: 'font-body',
      })
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-xl">ثبت گزارش کار روزانه</CardTitle>
            <CardDescription>
              فعالیت‌های امروز خود را با دقت وارد کنید.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاریخ</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-right font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>یک تاریخ انتخاب کنید</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wakeUpTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ساعت بیداری</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studyStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شروع مطالعه</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="mb-2 font-headline text-lg">آیتم‌های درسی</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>درس</TableHead>
                      <TableHead>مبحث</TableHead>
                      <TableHead>زمان مطالعه (دقیقه)</TableHead>
                      <TableHead>کل تست</TableHead>
                      <TableHead>درست</TableHead>
                      <TableHead>غلط</TableHead>
                      <TableHead>زمان تست (دقیقه)</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell><Input {...form.register(`items.${index}.subject`)} /></TableCell>
                        <TableCell><Input {...form.register(`items.${index}.topic`)} /></TableCell>
                        <TableCell><Input type="number" {...form.register(`items.${index}.studyTime`)} /></TableCell>
                        <TableCell><Input type="number" {...form.register(`items.${index}.testCount`)} /></TableCell>
                        <TableCell><Input type="number" {...form.register(`items.${index}.correctCount`)} /></TableCell>
                        <TableCell><Input type="number" {...form.register(`items.${index}.wrongCount`)} /></TableCell>
                        <TableCell><Input type="number" {...form.register(`items.${index}.testTime`)} /></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ subject: '', topic: '', studyTime: 0, testCount: 0, correctCount: 0, wrongCount: 0, testTime: 0 })}
              >
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن آیتم جدید
              </Button>
            </div>
            
            <div className="space-y-6 pt-4">
                <FormField control={form.control} name="sleepHours" render={({ field }) => (
                    <FormItem>
                        <FormLabel>میزان خواب: {field.value} ساعت</FormLabel>
                        <FormControl>
                            <Slider dir="ltr" defaultValue={field.value} onValueChange={field.onChange} max={12} step={0.5} />
                        </FormControl>
                    </FormItem>
                )} />
                 <FormField control={form.control} name="moodScore" render={({ field }) => (
                    <FormItem>
                        <FormLabel>ارزیابی روانی (فاجعه!): {field.value} از ۱۰</FormLabel>
                        <FormControl>
                            <Slider dir="ltr" defaultValue={field.value} onValueChange={field.onChange} max={10} step={1} />
                        </FormControl>
                    </FormItem>
                )} />
                 <FormField control={form.control} name="mobileHours" render={({ field }) => (
                    <FormItem>
                        <FormLabel>میزان موبایل: {field.value} ساعت</FormLabel>
                        <FormControl>
                            <Slider dir="ltr" defaultValue={field.value} onValueChange={field.onChange} max={10} step={0.5} />
                        </FormControl>
                    </FormItem>
                )} />
            </div>

            <div>
              <FormLabel>فایل ضمیمه (اختیاری)</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                 <Input id="file-upload" type="file" className="hidden" />
                 <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <FileUp className="ml-2 h-4 w-4" />
                        انتخاب فایل
                    </label>
                 </Button>
                 <span className="text-sm text-muted-foreground">هنوز فایلی انتخاب نشده.</span>
              </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg">
              <Save className="ml-2 h-4 w-4" />
              ثبت گزارش
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
