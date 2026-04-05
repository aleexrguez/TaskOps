import { z } from 'zod';
import {
  taskSchema,
  createTaskInputSchema,
  updateTaskInputSchema,
} from '../types';
import type { Task } from '../types';

export const taskResponseSchema = taskSchema;
export type TaskResponse = z.infer<typeof taskResponseSchema>;

export const taskListResponseSchema = z.object({
  tasks: z.array(taskSchema),
  total: z.number(),
});
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;

export const createTaskRequestSchema = createTaskInputSchema;
export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;

export const updateTaskRequestSchema = updateTaskInputSchema;
export type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>;

export function mapTaskFromApi(response: TaskResponse): Task {
  return response;
}
