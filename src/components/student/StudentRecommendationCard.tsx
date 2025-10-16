'use client';

import { Lightbulb, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import type { StudentRecommendation } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface StudentRecommendationCardProps {
  recommendation: StudentRecommendation;
}

export function StudentRecommendationCard({ recommendation }: StudentRecommendationCardProps) {
  const { firestore, user, role } = useFirebase();
  const { toast } = useToast();
  const teacherId = role?.split(':')[1];

  const handleMarkAsRead = () => {
    if (!user || !teacherId) return;

    const recommendationRef = doc(
      firestore,
      'teachers',
      teacherId,
      'students',
      user.uid,
      'recommendations',
      recommendation.id
    );

    updateDocumentNonBlocking(recommendationRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });

    toast({
      title: 'توصیه مطالعه شد',
      description: 'این توصیه به عنوان خوانده شده علامت‌گذاری شد.',
    });
  };

  return (
    <Card className="border-primary/30 bg-primary/5 animate-fade-in-up">
      <CardHeader>
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Lightbulb className="h-6 w-6" />
            </div>
            <div className="flex-1">
                <CardTitle className="font-headline text-lg">توصیه جدید از طرف مشاور</CardTitle>
                 <CardDescription>
                    تاریخ ارسال: {new Date(recommendation.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed text-foreground/90">{recommendation.content}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleMarkAsRead}>
          <CheckCircle className="ml-2 h-4 w-4" />
          خواندم و متوجه شدم
        </Button>
      </CardFooter>
    </Card>
  );
}
