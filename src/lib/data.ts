import type { Student, DailyReport } from './types';

// This is now mock data. The app will use Firestore.
export const students: Student[] = [
  { id: '1', teacherId: '05OiQevVDkNy9MmhveRs9h2w81y2', firstName: 'سارا', lastName: 'رضایی', gradeLevel: 'دهم', major: 'تجربی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-2/100/100', email: 'sara@example.com' },
  { id: '2', teacherId: '05OiQevVDkNy9MmhveRs9h2w81y2', firstName: 'علی', lastName: 'محمدی', gradeLevel: 'یازدهم', major: 'ریاضی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-1/100/100', email: 'ali@example.com' },
  { id: '3', teacherId: '05OiQevVDkNy9MmhveRs9h2w81y2', firstName: 'فاطمه', lastName: 'حسینی', gradeLevel: 'دوازدهم', major: 'انسانی', isActive: false, avatarUrl: 'https://picsum.photos/seed/user-5/100/100', email: 'fatemeh@example.com' },
  { id: '4', teacherId: '05OiQevVDkNy9MmhveRs9h2w81y2', firstName: 'رضا', lastName: 'احمدی', gradeLevel: 'دهم', major: 'ریاضی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-3/100/100', email: 'reza@example.com' },
  { id: '5', teacherId: '05OiQevVDkNy9MmhveRs9h2w81y2', firstName: 'محمد', lastName: 'اکبری', gradeLevel: 'یازدهم', major: 'تجربی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-6/100/100', email: 'mohammad@example.com' },
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
