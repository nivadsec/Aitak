'use client'

import { DailyReportForm } from '@/components/student/DailyReportForm';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { StudentRecommendation } from '@/lib/types';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';


export default function DailyReportPage() {
    const { firestore, user, role } = useFirebase();
    const teacherId = role?.split(':')[1];

    const recommendationQuery = useMemoFirebase(() => {
        if (!user || !firestore || !teacherId) return null;
        return query(
            collection(firestore, 'teachers', teacherId, 'students', user.uid, 'recommendations'),
            where('isRead', '==', false),
            orderBy('createdAt', 'desc'),
            limit(1)
        )
    }, [firestore, user, teacherId]);

    const { data: recommendations } = useCollection<StudentRecommendation>(recommendationQuery);
    const unreadRecommendation = recommendations?.[0];
    const isReportSubmissionBlocked = unreadRecommendation?.isBlocking && !unreadRecommendation?.isRead;

    return (
        <div className="max-w-4xl mx-auto">
            <DailyReportForm isBlocked={isReportSubmissionBlocked} />
        </div>
    )
}
