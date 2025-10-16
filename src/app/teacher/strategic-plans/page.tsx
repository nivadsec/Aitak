
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import type { StrategicPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, PlusCircle, Trash2, Edit, MoreVertical, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';

// Form Schema
const planSchema = z.object({
  title: z.string().min(5, 'عنوان باید حداقل ۵ کاراکتر باشد.'),
  description: z.string().optional(),
  fileUrl: z.string().url('آدرس فایل باید یک URL معتبر باشد.').optional().or(z.literal('')),
});

type PlanFormValues = z.infer<typeof planSchema>;

// PlanForm Component
function PlanForm({ plan, onSuccess }: { plan?: StrategicPlan, onSuccess: () => void }) {
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditMode = !!plan;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: plan?.title || '',
      description: plan?.description || '',
      fileUrl: plan?.fileUrl || '',
    },
  });

  async function onSubmit(data: PlanFormValues) {
    if (!user) return;
    setIsLoading(true);

    const planData = {
      teacherId: user.uid,
      ...data,
      createdAt: isEditMode ? plan.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEditMode) {
        const planRef = doc(firestore, 'teachers', user.uid, 'strategicPlans', plan.id);
        await updateDocumentNonBlocking(planRef, planData);
        toast({ title: 'برنامه به‌روزرسانی شد' });
      } else {
        const newPlanRef = doc(collection(firestore, 'teachers', user.uid, 'strategicPlans'));
        await setDocumentNonBlocking(newPlanRef, { ...planData, id: newPlanRef.id }, {});
        toast({ title: 'برنامه جدید ایجاد شد' });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({ title: 'خطا در ذخیره‌سازی', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>عنوان برنامه</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>توضیحات</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="fileUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>لینک فایل (PDF)</FormLabel>
            <FormControl><Input placeholder="https://example.com/plan.pdf" {...field} /></FormControl>
            <FormDescription>لینک مستقیم فایل PDF برنامه راهبردی را وارد کنید.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{isEditMode ? 'ذخیره تغییرات' : 'ایجاد برنامه'}</Button>
        </div>
      </form>
    </Form>
  );
}


export default function TeacherStrategicPlansPage() {
    const { firestore, user } = useFirebase();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingPlan, setEditingPlan] = React.useState<StrategicPlan | undefined>(undefined);
    const [deletingPlan, setDeletingPlan] = React.useState<StrategicPlan | null>(null);
    const {toast} = useToast();

    const plansQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'strategicPlans'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: plans, isLoading } = useCollection<StrategicPlan>(plansQuery);

    const openEditDialog = (plan: StrategicPlan) => {
        setEditingPlan(plan);
        setIsDialogOpen(true);
    };
    
    const openNewDialog = () => {
        setEditingPlan(undefined);
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (!user || !deletingPlan) return;
        const planRef = doc(firestore, 'teachers', user.uid, 'strategicPlans', deletingPlan.id);
        deleteDocumentNonBlocking(planRef);
        setDeletingPlan(null);
        toast({ title: "برنامه حذف شد", variant: 'destructive'});
    };


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="space-y-6">
                 <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline text-xl flex items-center gap-2">
                                <Map />
                                مدیریت برنامه‌های راهبردی
                            </CardTitle>
                            <CardDescription>
                                برنامه‌های راهبردی آزمون‌ها را برای دانش‌آموزان خود ایجاد و مدیریت کنید.
                            </CardDescription>
                        </div>
                         <Button onClick={openNewDialog}>
                            <PlusCircle className="ml-2 h-4 w-4" />
                            برنامه جدید
                        </Button>
                    </CardHeader>
                     <CardContent>
                        {isLoading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ) : (
                            plans && plans.length > 0 ? (
                                <div className="space-y-4">
                                    {plans.map(plan => (
                                        <Card key={plan.id}>
                                            <CardHeader className="flex-row items-start justify-between">
                                                <div>
                                                    <CardTitle className="font-headline text-lg">{plan.title}</CardTitle>
                                                    <CardDescription>
                                                        منتشر شده در: {new Date(plan.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
                                                    </CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(plan)}><Edit className="ml-2 h-4 w-4" /> ویرایش</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => setDeletingPlan(plan)}><Trash2 className="ml-2 h-4 w-4" /> حذف</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                 <p className="text-muted-foreground text-center py-8">هنوز هیچ برنامه‌ای ایجاد نشده است.</p>
                            )
                        )}
                    </CardContent>
                </Card>
                 <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{editingPlan ? 'ویرایش برنامه' : 'ایجاد برنامه جدید'}</DialogTitle>
                        <DialogDescription>{editingPlan ? 'اطلاعات برنامه را ویرایش کنید.' : 'اطلاعات برنامه جدید را وارد کنید.'}</DialogDescription>
                    </DialogHeader>
                    <PlanForm plan={editingPlan} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>

                <AlertDialog open={!!deletingPlan} onOpenChange={(open) => !open && setDeletingPlan(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline flex items-center gap-2">
                                <AlertTriangle className="text-destructive" />
                                آیا از حذف این برنامه مطمئن هستید؟
                            </AlertDialogTitle>
                            <AlertDialogDescription>این عمل قابل بازگشت نیست.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>انصراف</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Dialog>
    )
}
