import { Suspense } from 'react';
import RootLoading from '@/app/loading';
import { TaskFlowWorkspace } from '@/components/tasks/task-flow-workspace';

export default function HomePage() {
  return (
    <Suspense fallback={<RootLoading />}>
      <TaskFlowWorkspace />
    </Suspense>
  );
}
