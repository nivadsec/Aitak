'use client';

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
  
  // Feature flags
  assistantEnabled?: boolean;
  canViewStats?: boolean;
  canViewSchedule?: boolean;
  canSubmitDailyReport?: boolean;
  canViewQuestionnaires?: boolean;
  canViewTests?: boolean;
  canSubmitWeeklyReport?: boolean;
  canSubmitExamAnalysis?: boolean;
  canSubmitFocusLadder?: boolean;
  canSubmitTopicInvestment?: boolean;
  canViewStrategicPlans?: boolean;
  canViewConsultingContent?: boolean;
  canSubmitOverallExamAnalysis?: boolean;
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

export interface DailyReport {
  studentId: string;
  date: string;
  wakeUpTime: string;
  studyStartTime: string;
  studyEndTime: string;
  items: DailyReportItem[];
  classMinutes: number;
  sleepHours: number;
  disasterLevel: number;
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

export interface RecommendationQuizQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
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
    quiz?: {
        title: string;
        questions: RecommendationQuizQuestion[];
    };
}

export interface FocusInterval {
    id: string;
    studentId: string;
    intervalName: string;
    score: number;
    timestamp: any; // Firestore Timestamp
    startTime: string;
    endTime: string;
    duration: number; // in minutes
}

export interface QuestionnaireQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    duration?: number; // Optional: duration in seconds for this specific question
}

export interface Questionnaire {
    id: string;
    teacherId: string;
    title: string;
    questions: QuestionnaireQuestion[];
    duration?: number; // Optional: overall questionnaire duration in minutes
    allowBackNavigation: boolean; // Whether the student can go back to previous questions
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface QuestionnaireSubmission {
    id: string;
    questionnaireId: string;
    studentId: string;
    answers: (number | null)[]; // Array of selected option indices, null if unanswered
    score: number; // Percentage score
    submittedAt: any; // Firestore Timestamp
}

export interface TestQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    duration?: number; // Optional: duration in seconds for this specific question
}

export interface Test {
    id: string;
    teacherId: string;
    title: string;
    questions: TestQuestion[];
    duration?: number; // Optional: overall test duration in minutes
    allowBackNavigation: boolean; // Whether the student can go back to previous questions
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface TestSubmission {
    id: string;
    testId: string;
    studentId: string;
    answers: (number | null)[]; // Array of selected option indices, null if unanswered
    score: number; // Percentage score
    submittedAt: any; // Firestore Timestamp
}


export interface StrategicPlan {
    id: string;
    teacherId: string;
    title: string;
    description?: string;
    fileUrl?: string;
    createdAt: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
}

export interface ScheduleItem {
    id: string;
    teacherId: string;
    title: string;
    description?: string;
    dateTime: any; // Firestore Timestamp
    link?: string;
    createdAt: any;
    updatedAt: any;
}

export interface ConsultingContent {
    id: string;
    teacherId: string;
    title: string;
    content: string;
    videoUrl?: string;
    createdAt: any;
    updatedAt: any;
}

export interface LoginHistory {
    id: string;
    studentId: string;
    studentName?: string;
    email: string;
    timestamp: any; // Firestore Timestamp
    type: 'login' | 'logout';
    status: 'success' | 'failure';
    failureReason?: string;
}

export interface OverallExamEntry {
    examNumber: number;
    date: Date;
    correctCount: number;
    incorrectCount: number;
    percentage: number;
    questionsAnswered: number;
    satisfaction: number;
    notes?: string;
}

export interface OverallExamReport {
    id: string;
    studentId: string;
    subjectName: string;
    examEntries: OverallExamEntry[];
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface QuestionAnswer {
    id: string;
    studentId: string;
    teacherId: string;
    question: string;
    answer?: string;
    isAnswered: boolean;
    createdAt: any; // Firestore Timestamp
    answeredAt?: any; // Firestore Timestamp
}
