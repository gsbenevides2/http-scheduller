import type { CronJob } from "bun";
import { HttpSchedullerService } from "./HttpScheduller";

interface CronnerJobBase {
  id: string;
  triggerType: "cron" | "date";
  triggerValue: string;
}

type CronnerJob =
  | (CronnerJobBase & {
      triggerType: "cron";
      triggerValue: string; // cron expression
    })
  | (CronnerJobBase & {
      triggerType: "date";
      triggerValue: string; // ISO date or date string parseable by Date
    });

type JobHandle = CronJob | ReturnType<typeof setTimeout>;

// Maximum safe setTimeout delay (signed 32-bit int max)
const MAX_TIMEOUT_MS = 2_147_483_647;

export class CronnerService {
  static jobs = new Map<string, JobHandle>();

  static async addJob(job: CronnerJob) {
    if (CronnerService.checkJobExists(job.id)) {
      await CronnerService.removeJob(job.id);
    }

    if (job.triggerType === "cron") {
      const handle = Bun.cron(job.triggerValue, async () => {
        await CronnerService.processJob(job.id);
      });
      this.jobs.set(job.id, handle);
      return;
    }

    // triggerType === "date"
    const targetDate = new Date(job.triggerValue);
    if (Number.isNaN(targetDate.getTime())) {
      console.warn(
        `[CronnerService] Invalid date triggerValue for ${job.id}: ${job.triggerValue}`,
      );
      return;
    }

    CronnerService.scheduleTimeout(job.id, targetDate);
  }

  private static scheduleTimeout(jobId: string, targetDate: Date) {
    const remaining = targetDate.getTime() - Date.now();

    if (remaining <= 0) {
      // Target time has passed, execute immediately
      CronnerService.processJob(jobId);
      return;
    }

    // Schedule timeout with safe delay (chunk if necessary)
    const delay = Math.min(remaining, MAX_TIMEOUT_MS);
    const handle = setTimeout(() => {
      const newRemaining = targetDate.getTime() - Date.now();

      if (newRemaining <= 0) {
        // Time to execute
        CronnerService.processJob(jobId);
      } else {
        // Reschedule for remaining time
        CronnerService.scheduleTimeout(jobId, targetDate);
      }
    }, delay);

    this.jobs.set(jobId, handle);
  }

  static checkJobExists(id: string) {
    return this.jobs.has(id);
  }

  static async removeJob(id: string) {
    const handle = this.jobs.get(id);
    if (handle) {
      // CronJob has stop(); timeout has clearTimeout
      if (typeof (handle as CronJob).stop === "function") {
        (handle as CronJob).stop();
      } else {
        clearTimeout(handle as ReturnType<typeof setTimeout>);
      }
      this.jobs.delete(id);
    }
  }

  static async processJob(id: string) {
    const scheduler = await HttpSchedullerService.getById(id);
    if (!scheduler) return;

    if (scheduler.excludeBeforeExecution) {
      await CronnerService.removeJob(id);
      await HttpSchedullerService.deleteById(id);
    }

    await fetch(scheduler.url, {
      method: scheduler.method,
      headers: scheduler.headers,
      body: scheduler.body,
    });
  }

  static async gracefulShutdown() {
    for (const [id, handle] of this.jobs) {
      if (typeof (handle as CronJob).stop === "function") {
        (handle as CronJob).stop();
      } else {
        clearTimeout(handle as ReturnType<typeof setTimeout>);
      }
      this.jobs.delete(id);
    }
  }

  static async gracefulStart() {
    const schedullers = await HttpSchedullerService.getAll();
    for (const scheduler of schedullers) {
      await CronnerService.addJob({
        id: scheduler.externalId,
        triggerType: scheduler.triggerType,
        triggerValue: scheduler.triggerValue,
      });
    }
  }
}
