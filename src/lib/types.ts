export interface Student {
  id: string; // This will be the Firebase Auth UID
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: string;
  major: string;
  isActive: boolean;
  avatarUrl?: string; // Optional avatar
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

export interface ExamAnalysisSubject {
  subject: string;
  before_exam: {
    previous_score?: number;
    goal_first?: number;
  };
  execution: {
    correct: number;
    wrong: number;
    blank: number;
    time_spent?: number;
    notes?: string;
  };
  after_exam: {
    score?: number;
  };
}

export interface EffortCompare {
    subject: string;
    study_hours?: number;
    test_hours?: number;
    exam_score?: number;
    teacher_opinion?: string;
    reason?: string;
}


export interface ExamReport {
  id: string;
  studentId: string;
  exam_date: Date;
  total_score?: number;
  rank_country?: number;
  subjects_summary_correct?: number;
  subjects_summary_wrong?: number;
  subjects_summary_blank?: number;
  exam_analysis: ExamAnalysisSubject[];
  effort_compare: EffortCompare[];
}

export interface WeeklyProgressReport {
    id: string;
    studentId: string;
    weekNumber: number;
    weekDateRange: string;
    studyTimeDetails: Array<{ subject: string; targetTime: number; actualTime: number; }>;
    testDetails: Array<{ subject: string; targetCount: number; actualCount: number; }>;
    lastWeekTotalStudy: number;
    thisWeekTotalStudy: number;
    lastWeekTotalTests: number;
    thisWeekTotalTests: number;
    keyAchievements?: string;
    whatWentWell?: string;
    whatCouldBeBetter?: string;
    nextWeekGoals?: string;
}

export interface TopicInvestmentReport {
    id: string;
    studentId: string;
    lessonName: string;
    averageScore?: number;
    mostColor?: string;
    holidayGoal?: string;
    examGoal?: string;
    lessonTimeInvestment?: number;
    partCount?: number;
    partTime?: number;
    finalNotes?: string;
    topics: Array<{
        topic: string;
        priority: number;
        studyHours: number;
        videoHours: number;
        testHours: number;
        extraActions?: string;
    }>;
}

export interface StudentRecommendation {
    id: string;
    studentId: string;
    teacherId: string;
    content: string;
    isRead: boolean;
    isBlocking: boolean;
    createdAt: any; // Firestore Timestamp
    readAt?: any; // Firestore Timestamp
}
