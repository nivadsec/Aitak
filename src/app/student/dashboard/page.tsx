import { DailyReportForm } from '@/components/student/DailyReportForm';
import PersonalStats from '@/components/student/PersonalStats';

export default function StudentDashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <DailyReportForm />
      </div>
      <div className="lg:col-span-1">
        <PersonalStats />
      </div>
    </div>
  );
}
