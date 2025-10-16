
'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, BrainCircuit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function StudentAssistantRow({ student }: { student: Student }) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();

    const handleToggle = (checked: boolean) => {
        if (!user) return;
        const studentRef = doc(firestore, 'teachers', user.uid, 'students', student.id);
        updateDocumentNonBlocking(studentRef, { assistantEnabled: checked });
        toast({
            title: `دسترسی ${student.firstName} تغییر کرد`,
            description: `ربات هوشمند برای این دانش‌آموز ${checked ? 'فعال' : 'غیرفعال'} شد.`,
        });
    };

    return (
        <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
             <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={student.avatarUrl} />
                    <AvatarFallback>{student.firstName?.[0]}{student.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                    id={`assistant-switch-${student.id}`}
                    checked={student.assistantEnabled}
                    onCheckedChange={handleToggle}
                />
                <Label htmlFor={`assistant-switch-${student.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {student.assistantEnabled ? 'فعال' : 'غیرفعال'}
                </Label>
            </div>
        </div>
    );
}


export default function TeacherAssistantPage() {
    const { firestore, user } = useFirebase();

    const studentsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'students'));
    }, [firestore, user]);

    const { data: students, isLoading } = useCollection<Student>(studentsQuery);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <Bot className="h-7 w-7 text-primary" />
                        مدیریت ربات هوشمند
                    </CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید دسترسی هر دانش‌آموز به ربات مشاور هوشمند را فعال یا غیرفعال کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">لیست دانش‌آموزان</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {students && students.length > 0 ? (
                                students.map(student => (
                                    <StudentAssistantRow key={student.id} student={student} />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    هنوز دانش‌آموزی برای مدیریت وجود ندارد.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
