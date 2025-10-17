'use client';

import React from 'react';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import type { Quiz, QuizSubmission, Student } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Percent, User, Calendar, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function QuizResultsPage({ params }: { params: { id: string } }) {
    const { firestore, user } = useFirebase();
    const { id } = params;

    const quizRef = useMemoFirebase(() => {
        if (!user || !id) return null;
        return doc(firestore, 'teachers', user.uid, 'quizzes', id);
    }, [firestore, user, id]);

    const submissionsQuery = useMemoFirebase(() => {
        if (!user || !id) return null;
        return query(collection(firestore, 'teachers', user.uid, 'quizzes', id, 'submissions'), orderBy('submittedAt', 'desc'));
    }, [firestore, user, id]);

    const studentsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teachers', user.uid, 'students'));
    }, [firestore, user]);

    const { data: quiz, isLoading: isQuizLoading } = useDoc<Quiz>(quizRef);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<QuizSubmission>(submissionsQuery);
    const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);

    const studentsMap = React.useMemo(() => {
        if (!students) return new Map();
        return new Map(students.map(s => [s.id, s]));
    }, [students]);
    
    const isLoading = isQuizLoading || areSubmissionsLoading || areStudentsLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!quiz) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <FileText className="h-7 w-7 text-primary" />
                        نتایج آزمون: {quiz.title}
                    </CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید نتایج ثبت شده توسط دانش‌آموزان برای این آزمون را مشاهده کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">لیست نتایج</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><User className="inline-block ml-1 h-4 w-4" />دانش‌آموز</TableHead>
                                <TableHead><Percent className="inline-block ml-1 h-4 w-4" />نمره</TableHead>
                                <TableHead><Calendar className="inline-block ml-1 h-4 w-4" />تاریخ ثبت</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions && submissions.length > 0 ? (
                                submissions.map(sub => {
                                    const student = studentsMap.get(sub.studentId);
                                    return (
                                        <TableRow key={sub.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={student?.avatarUrl} />
                                                        <AvatarFallback>{student?.firstName?.[0]}{student?.lastName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{student?.firstName} {student?.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">{student?.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-lg">{sub.score.toFixed(1)}%</TableCell>
                                            <TableCell>{new Date(sub.submittedAt?.seconds * 1000).toLocaleString('fa-IR')}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        هنوز هیچ نتیجه‌ای برای این آزمون ثبت نشده است.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    

    