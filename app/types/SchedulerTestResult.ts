export type SchedulerTestResult = {
  ok: boolean;
  status?: number;
  body?: string;
  timeMs?: number;
  error?: string;
};
