import type { Student, StudentReport } from './types';

// This is now mock data. The app will use Firestore.
export const students: Student[] = [
  { id: '1', firstName: 'سارا', lastName: 'رضایی', gradeLevel: 'دهم', major: 'تجربی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-2/100/100', email: 'sara@example.com' },
  { id: '2', firstName: 'علی', lastName: 'محمدی', gradeLevel: 'یازدهم', major: 'ریاضی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-1/100/100', email: 'ali@example.com' },
  { id: '3', firstName: 'فاطمه', lastName: 'حسینی', gradeLevel: 'دوازدهم', major: 'انسانی', isActive: false, avatarUrl: 'https://picsum.photos/seed/user-5/100/100', email: 'fatemeh@example.com' },
  { id: '4', firstName: 'رضا', lastName: 'احمدی', gradeLevel: 'دهم', major: 'ریاضی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-3/100/100', email: 'reza@example.com' },
  { id: '5', firstName: 'محمد', lastName: 'اکبری', gradeLevel: 'یازدهم', major: 'تجربی', isActive: true, avatarUrl: 'https://picsum.photos/seed/user-6/100/100', email: 'mohammad@example.com' },
];

export const reports: StudentReport[] = [
  {
    studentId: '1',
    date: '2024-05-20',
    wakeUpTime: '07:00',
    studyStartTime: '08:30',
    studyEndTime: '17:00',
    items: [
      { subject: 'ریاضی', topic: 'فصل ۳ - مثلثات', studyTime: 120, testCount: 20, correctCount: 15, wrongCount: 5, testTime: 45 },
      { subject: 'فیزیک', topic: 'فصل ۲ - دینامیک', studyTime: 90, testCount: 15, correctCount: 10, wrongCount: 5, testTime: 30 },
    ],
    classMinutes: 90,
    sleepHours: 7.5,
    moodScore: 8,
    mobileHours: 2,
  },
  {
    studentId: '2',
    date: '2024-05-20',
    wakeUpTime: '08:00',
    studyStartTime: '09:00',
    studyEndTime: '16:00',
    items: [
      { subject: 'شیمی', topic: 'فصل ۱ - استوکیومتری', studyTime: 100, testCount: 25, correctCount: 22, wrongCount: 3, testTime: 50 },
    ],
    classMinutes: 0,
    sleepHours: 8,
    moodScore: 7,
    mobileHours: 3,
  },
    {
    studentId: '1',
    date: '2024-05-19',
    wakeUpTime: '07:30',
    studyStartTime: '09:00',
    studyEndTime: '16:30',
    items: [
      { subject: 'ریاضی', topic: 'فصل ۲ - معادلات', studyTime: 110, testCount: 20, correctCount: 18, wrongCount: 2, testTime: 40 },
      { subject: 'ادبیات', topic: 'آرایه‌های ادبی', studyTime: 60, testCount: 30, correctCount: 25, wrongCount: 5, testTime: 25 },
    ],
    classMinutes: 45,
    sleepHours: 7,
    moodScore: 6,
    mobileHours: 2.5,
  },
    {
    studentId: '2',
    date: '2024-05-19',
    wakeUpTime: '07:00',
    studyStartTime: '08:00',
    studyEndTime: '15:00',
    items: [
      { subject: 'شیمی', topic: 'فصل ۱ - ساختار اتم', studyTime: 150, testCount: 30, correctCount: 20, wrongCount: 10, testTime: 60 },
    ],
    classMinutes: 90,
    sleepHours: 6.5,
    moodScore: 5,
    mobileHours: 4,
  }
];

export const getStudentById = (id: string) => students.find(s => s.id === id);

export const getReportsForStudent = (studentId: string) => reports.filter(r => r.studentId === studentId);

export const getDailyReportsForGenkit = (studentId: string) => {
    const studentReports = getReportsForStudent(studentId);
    if (!studentReports || studentReports.length === 0) return [];
    
    return studentReports.map(report => {
        const totalStudyTime = report.items.reduce((total, item) => total + item.studyTime, 0);
        const totalTests = report.items.reduce((total, item) => total + item.testCount, 0);
        const totalCorrect = report.items.reduce((total, item) => total + item.correctCount, 0);

        return {
            date: report.date,
            studyHours: totalStudyTime / 60,
            testCorrectPercentage: totalTests > 0 ? (totalCorrect / totalTests) * 100 : 0,
            moodRating: report.moodScore,
            mobileUsageHours: report.mobileHours,
        };
    });
}
