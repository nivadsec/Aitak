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
  exam_date: string;
  total_score?: number;
  rank_country?: number;
  subjects_summary?: {
    correct?: number;
    wrong?: number;
    blank?: number;
  };
  exam_analysis: ExamAnalysisSubject[];
  effort_compare: EffortCompare[];
}
