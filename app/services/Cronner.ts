import type { CronJob } from "bun";
import { HttpSchedullerService } from "./HttpScheduller";

interface CronnerJob {
  id: string;
  type: "cron" | "date";
  triggerValue: string;
}

export class CronnerService {
  static jobs = new Map<string, CronJob>();
  static async addJob(job: CronnerJob) {
    if (CronnerService.checkJobExists(job.id)) {
      await CronnerService.removeJob(job.id);
    }
    const handle = Bun.cron(job.triggerValue, async () => {
      await CronnerService.processJob(job.id);
    });
    this.jobs.set(job.id, handle);
  }

  static checkJobExists(id: string) {
    return this.jobs.has(id);
  }

  static async removeJob(id: string) {
    const handle = this.jobs.get(id);
    if (handle) {
      handle.stop();
      this.jobs.delete(id);
    }
  }

  static async processJob(id: string) {
    const scheduler = await HttpSchedullerService.getById(id);
    console.log(`Processing job ${id} with scheduler:`, scheduler);
    if (!scheduler) {
      return;
    }

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
      handle.stop();
      this.jobs.delete(id);
    }
  }

  static async gracefulStart() {
    const schedullers = await HttpSchedullerService.getAll();
    for (const scheduler of schedullers) {
      await CronnerService.addJob({
        id: scheduler.externalId,
        type: scheduler.triggerType,
        triggerValue: scheduler.triggerValue,
      });
    }
  }
}
