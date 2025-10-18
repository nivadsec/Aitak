
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { ArrowLeft } from 'lucide-react';

export default function LandingPage() {
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
