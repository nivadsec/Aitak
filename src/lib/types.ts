export interface Student {
  id: string;
  name: string;
  class: string;
  avatarUrl: string;
}

export interface DailyReportItem {
  subject: string;
  topic: string;
  studyTime: number; // in minutes
  testCount: number;
  correctCount: number;
  wrongCount: number;
  testTime: number; // in minutes
}

export interface StudentReport {
  studentId: string;
  date: string;
  wakeUpTime: string;
  studyStartTime: string;
  studyEndTime: string;
  items: DailyReportItem[];
  classMinutes: number;
  sleepHours: number;
  moodScore: number; // 1 to 10
  mobileHours: number;
  attachmentUrl?: string;
}
