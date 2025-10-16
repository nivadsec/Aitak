
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, CheckCircle2, XCircle, LogIn, LogOut } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { LoginHistory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function TeacherHistoryPage() {
    const { firestore, user } = useFirebase();

    const historyQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'teachers', user.uid, 'loginHistory'),
            orderBy('timestamp', 'desc'),
            limit(50) // Limit to the last 50 events for performance
        );
    }, [firestore, user]);

    const { data: history, isLoading } = useCollection<LoginHistory>(historyQuery);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <History />
                        تاریخچه ورود و خروج
                    </CardTitle>
                    <CardDescription>
                        آخرین فعالیت‌های ورود و خروج دانش‌آموزان را مشاهده کنید.
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
                                    {history && history.length > 0 ? (
                                        history.map((item) => (
                                            <TableRow key={item.id} className={cn(item.status === 'failure' && 'bg-destructive/5')}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            {/* Avatar image can be added if student info is fetched */}
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
                                                    {item.timestamp ? new Date(item.timestamp?.seconds * 1000).toLocaleString('fa-IR') : '...'}
                                                </TableCell>
                                            </TableRow>
                                        ))
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
