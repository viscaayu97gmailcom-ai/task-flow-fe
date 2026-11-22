import { Suspense } from 'react';
import RootLoading from '@/app/loading';
import { TaskDetailPageView } from '@/components/tasks/task-detail-page-view';

export default function TaskDetailPage() {
  return (
    <Suspense fallback={<RootLoading />}>
      <TaskDetailPageView />
    </Suspense>
  );
}
