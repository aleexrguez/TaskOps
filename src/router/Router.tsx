import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  TaskDashboardContainer,
  TaskDetailContainer,
} from '@/features/task-manager/containers';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TaskDashboardContainer />} />
        <Route path="/tasks/:id" element={<TaskDetailContainer />} />
      </Routes>
    </BrowserRouter>
  );
}
