
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, CheckCircle2, XCircle, LogIn, LogOut } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { LoginHistory, Student } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data
const mockStudents: Partial<Student>[] = [
    { id: '1', firstName: 'سارا', lastName: 'رضایی', email: 'sara@example.com' },
    { id: '2', firstName: 'علی', lastName: 'محمدی', email: 'ali@example.com' },
];

const mockHistory: LoginHistory[] = [
    { id: 'h1', studentId: '1', studentName: 'سارا رضایی', email: 'sara@example.com', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'login', status: 'success' },
    { id: 'h2', studentId: '2', studentName: 'علی محمدی', email: 'ali@example.com', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), type: 'login', status: 'success' },
    { id: 'h3', studentId: '1', studentName: 'سارا رضایی', email: 'sara@example.com', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), type: 'logout', status: 'success' },
    { id: 'h4', studentId: '3', studentName: 'کاربر ناشناس', email: 'unknown@example.com', timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000), type: 'login', status: 'failure', failureReason: 'user-not-found' },
    { id: 'h5', studentId: '2', studentName: 'علی محمدی', email: 'ali@example.com', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), type: 'login', status: 'failure', failureReason: 'wrong-password' },
    { id: 'h6', studentId: '2', studentName: 'علی محمدی', email: 'ali@example.com', timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), type: 'login', status: 'success' },
];


export default function TeacherHistoryPage() {
    const isLoading = false; // Set to false to show mock data

    const getStudentInfo = (studentId: string) => {
        return mockStudents.find(s => s.id === studentId);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <History />
                        تاریخچه ورود و خروج
                    </CardTitle>
                    <CardDescription>
                        آخرین فعالیت‌های ورود و خروج و تلاش‌های ناموفق دانش‌آموزان را مشاهده کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="rounded-md border">
                           <Table>
                             <TableHeader>
                               <TableRow>
                                 {[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>)}
                               </TableRow>
                             </TableHeader>
                             <TableBody>
                               {[...Array(5)].map((_, i) => (
                                 <TableRow key={i}>
                                   {[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                                 </TableRow>
                               ))}
                             </TableBody>
                           </Table>
                         </div>
                    ) : (
                         <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>دانش‌آموز</TableHead>
                                        <TableHead>نوع رویداد</TableHead>
                                        <TableHead>وضعیت</TableHead>
                                        <TableHead>زمان</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockHistory.length > 0 ? (
                                        mockHistory.map((item) => {
                                            const student = getStudentInfo(item.studentId);
                                            return (
                                                <TableRow key={item.id} className={cn(item.status === 'failure' && 'bg-destructive/5')}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarImage src={student?.avatarUrl} />
                                                                <AvatarFallback>{item.studentName?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{item.studentName}</p>
                                                                <p className="text-xs text-muted-foreground">{item.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {item.type === 'login' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                                                            {item.type === 'login' ? 'ورود' : 'خروج'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                                                            <div className="flex items-center gap-1">
                                                                {item.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                                {item.status === 'success' ? 'موفق' : 'ناموفق'}
                                                            </div>
                                                        </Badge>
                                                        {item.failureReason && (
                                                            <p className="text-xs text-muted-foreground mt-1">{item.failureReason === 'wrong-password' ? 'رمز اشتباه' : 'کاربر یافت نشد'}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-xs">
                                                        {new Date(item.timestamp).toLocaleString('fa-IR')}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                         <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">
                                                تاریخچه‌ای برای نمایش وجود ندارد.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

