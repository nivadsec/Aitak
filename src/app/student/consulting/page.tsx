
'use client';

import React from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { ConsultingContent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Video } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function ContentItem({ content }: { content: ConsultingContent }) {
    return (
        <AccordionItem value={content.id}>
            <AccordionTrigger>
                 <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-headline text-lg">{content.title}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{content.content}</p>
                    {content.videoUrl && (
                        <Button asChild variant="secondary">
                             <Link href={content.videoUrl} target="_blank" rel="noopener noreferrer">
                                <Video className="ml-2 h-4 w-4" />
                                مشاهده ویدیو
                            </Link>
                        </Button>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function StudentConsultingPage() {
    const { firestore, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const contentQuery = useMemoFirebase(() => {
        if (!teacherId) return null;
        return query(collection(firestore, 'teachers', teacherId, 'consultingContent'), orderBy('createdAt', 'desc'));
    }, [firestore, teacherId]);

    const { data: contents, isLoading } = useCollection<ConsultingContent>(contentQuery);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <BookOpen className="h-7 w-7 text-primary" />
                        محتوای مشاوره‌ای
                    </CardTitle>
                    <CardDescription>
                        در این بخش می‌توانید مقالات و ویدیوهای مشاوره‌ای که توسط معلم شما منتشر شده را مشاهده کنید.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                 <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        contents && contents.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {contents.map(c => (
                                    <ContentItem key={c.id} content={c} />
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-muted-foreground text-center p-12">
                                هنوز هیچ محتوای مشاوره‌ای توسط معلم شما منتشر نشده است.
                            </p>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
