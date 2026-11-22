import { Suspense } from 'react';
import RootLoading from '@/app/loading';
import { TaskAnalyticsView } from '@/components/tasks/task-analytics-view';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<RootLoading />}>
      <TaskAnalyticsView />
    </Suspense>
  );
}
