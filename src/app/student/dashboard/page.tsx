import { DailyReportForm } from '@/components/student/DailyReportForm';
import PersonalStats from '@/components/student/PersonalStats';

export default function StudentDashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <DailyReportForm />
      </div>
      <div className="lg:col-span-2">
        <PersonalStats />
      </div>
    </div>
  );
}
