import type { Student, DailyReport } from './types';
import { collection, getDocs, query, limit, getFirestore, getApp } from 'firebase/firestore';


// This is now mock data. The app will use Firestore.
export const students: Student[] = [
  { id: '1', teacherId: 'default-teacher', firstName: 'سارا', lastName: 'رضایی', gradeLevel: 'دهم', major: 'تجربی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-2/100/100', email: 'sara@example.com' },
  { id: '2', teacherId: 'default-teacher', firstName: 'علی', lastName: 'محمدی', gradeLevel: 'یازدهم', major: 'ریاضی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-1/100/100', email: 'ali@example.com' },
  { id: '3', teacherId: 'default-teacher', firstName: 'فاطمه', lastName: 'حسینی', gradeLevel: 'دوازدهم', major: 'انسانی', isActive: false, avatarUrl: 'https://picsum.photos/seed/user-5/100/100', email: 'fatemeh@example.com' },
  { id: '4', teacherId: 'default-teacher', firstName: 'رضا', lastName: 'احمدی', gradeLevel: 'دهم', major: 'ریاضی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-3/100/100', email: 'reza@example.com' },
  { id: '5', teacherId: 'default-teacher', firstName: 'محمد', lastName: 'اکبری', gradeLevel: 'یازدهم', major: 'تجربی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-6/100/100', email: 'mohammad@example.com' },
];


// Updated function to accept reports directly
export const getDailyReportsForGenkit = (studentReports: DailyReport[]) => {
    if (!studentReports || studentReports.length === 0) return [];
    
    return studentReports.map(report => {
        // Convert Firestore Timestamp to a readable date string if necessary
        const reportDate = typeof report.date === 'string' ? report.date : (report.date as any).toDate().toISOString().split('T')[0];

        return {
            date: reportDate,
            studyHours: parseFloat((report.totalStudyMinutes / 60).toFixed(1)),
            testCorrectPercentage: parseFloat(report.items.reduce((acc, item) => acc + item.testPercentage, 0) / (report.items.length || 1)).toFixed(1),
            moodRating: report.disasterLevel,
            mobileUsageHours: report.minutesOfMobileUsage,
        };
    });
}

/**
 * Fetches the UID of the first (and only) teacher in the 'teachers' collection.
 * This is used during student sign-up to automatically associate them with the admin.
 * @param firestore - The Firestore instance.
 * @returns The UID of the admin teacher, or null if not found.
 */
export async function getAdminTeacherId(firestore: any): Promise<string | null> {
    try {
        const teachersRef = collection(firestore, 'teachers');
        const q = query(teachersRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Returns the ID of the first document in the collection
            return querySnapshot.docs[0].id;
        }
        console.warn("No teacher/admin account found in the 'teachers' collection.");
        return null;
    } catch (error) {
        console.error("Error fetching admin teacher ID:", error);
        return null;
    }
}