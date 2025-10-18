
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { ArrowLeft, BookOpen, Newspaper, Sparkles } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { ConsultingContent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ArticleCard = ({ article }: { article: ConsultingContent }) => {
  const contentSnippet = article.content.substring(0, 150);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-lg">
                    <Newspaper className="h-5 w-5" />
                </div>
                <CardTitle className="font-headline text-lg">{article.title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <CardDescription className="leading-relaxed">{contentSnippet}...</CardDescription>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                تاریخ انتشار: {new Date(article.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
            </p>
        </CardFooter>
    </Card>
  );
};

export default function LandingPage() {
    const { firestore } = useFirebase();

    // The content is public, so we fetch it from the teacher with the known ID
    const ADMIN_TEACHER_ID = '05OiQevVDkNy9MmhveRs9h2w81y2';
    const contentQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'teachers', ADMIN_TEACHER_ID, 'consultingContent'), orderBy('createdAt', 'desc'), limit(3));
    }, [firestore]);

    const { data: articles, isLoading } = useCollection<ConsultingContent>(contentQuery);

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="font-headline text-xl font-bold">آی‌تاک</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="/login">ورود</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/signup">ثبت‌نام</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="relative py-20 md:py-32">
                    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(116,188,198,0.2),transparent)]"></div></div>
                    <div className="container mx-auto px-4 md:px-6 text-center">
                        <div className="max-w-3xl mx-auto">
                            <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary font-headline mb-4">
                                پلتفرم هوشمند خودارزیابی و نظم شخصی
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tight">
                                مسیر موفقیت تحصیلی خود را با آی‌تاک هوشمندانه طی کنید
                            </h1>
                            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                                آی‌تاک با ابزارهای هوشمند و تحلیل داده، به شما کمک می‌کند تا نقاط ضعف و قوت خود را بشناسید، برنامه‌ریزی دقیقی داشته باشید و به اهداف تحصیلی خود برسید.
                            </p>
                            <div className="mt-8 flex justify-center gap-4">
                                <Button asChild size="lg">
                                    <Link href="/signup">شروع کنید <ArrowLeft className="mr-2 h-5 w-5" /></Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-muted/50 py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                             <h2 className="text-3xl md:text-4xl font-headline font-bold flex items-center justify-center gap-3">
                                <BookOpen className="h-8 w-8 text-primary"/>
                                آخرین مقالات و اخبار
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                جدیدترین مطالب مشاوره‌ای و اطلاعیه‌ها را در اینجا دنبال کنید.
                            </p>
                        </div>
                        
                        {isLoading ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : articles && articles.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {articles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        ) : (
                            <Card className="text-center p-12">
                                <p className="text-muted-foreground">در حال حاضر مقاله یا خبر جدیدی منتشر نشده است.</p>
                            </Card>
                        )}
                    </div>
                </section>
            </main>
            
            <footer className="border-t">
                <div className="container mx-auto py-6 px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © 1404 آی‌تاک. تمام حقوق محفوظ است. | طراحی و توسعه توسط <span className="font-semibold text-foreground">حسین طاهری</span>
                    </p>
                </div>
                </div>
            </footer>
        </div>
    );
}
