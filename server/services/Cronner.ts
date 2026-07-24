import type { CronJob } from "bun";
import { SchedulledRequests } from "../modules/schedulled_requests/service";

interface CronnerJob {
  id: string;
  triggerType: "cron" | "date";
  triggerValue: string;
}

type JobHandle = CronJob | ReturnType<typeof setTimeout>;

// Maximum safe setTimeout delay (signed 32-bit int max)
const MAX_TIMEOUT_MS = 2_147_483_647;

export class CronnerService {
  static jobs = new Map<string, JobHandle>();
  static jobVersions = new Map<string, number>();

  static async upsertJob(job: CronnerJob) {
    if (CronnerService.checkJobExists(job.id)) {
      await CronnerService.removeJob(job.id);
    }

    const currentVersion = CronnerService.jobVersions.get(job.id) ?? 0;
    const newVersion = currentVersion + 1;
    CronnerService.jobVersions.set(job.id, newVersion);

    if (job.triggerType === "cron") {
      const version = newVersion;
      const handle = Bun.cron(job.triggerValue, async () => {
        await CronnerService.processJob(job.id, version);
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

    CronnerService.scheduleTimeout(job.id, targetDate, newVersion);
  }

  private static scheduleTimeout(
    jobId: string,
    targetDate: Date,
    version: number,
  ) {
    const remaining = targetDate.getTime() - Date.now();

    if (remaining <= 0) {
      CronnerService.processJob(jobId, version);
      return;
    }

    const delay = Math.min(remaining, MAX_TIMEOUT_MS);
    const handle = setTimeout(() => {
      const newRemaining = targetDate.getTime() - Date.now();

      if (newRemaining <= 0) {
        CronnerService.processJob(jobId, version);
      } else {
        CronnerService.scheduleTimeout(jobId, targetDate, version);
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
      if ("stop" in handle) {
        handle.stop();
      } else {
        clearTimeout(handle);
      }
      this.jobs.delete(id);
    }
  }

  static async processJob(id: string, version?: number) {
    const isCurrentVersion =
      version === undefined || CronnerService.jobVersions.get(id) === version;

    if (!isCurrentVersion) {
      return;
    }

    const scheduler = await SchedulledRequests.getById(id);
    if (!scheduler) return;

    if (
      version !== undefined &&
      CronnerService.jobVersions.get(id) !== version
    ) {
      return;
    }

    if (scheduler.excludeBeforeExecution) {
      await CronnerService.removeJob(id);
      await SchedulledRequests.deleteMany([id]);
      return;
    }

    await SchedulledRequests.executeRequest(scheduler, id);
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
    this.jobVersions.clear();
  }

  static async gracefulStart() {
    const schedullers = await SchedulledRequests.getAll();
    for (const scheduler of schedullers) {
      await CronnerService.upsertJob({
        id: scheduler.externalId,
        triggerType: scheduler.triggerType,
        triggerValue: scheduler.triggerValue,
      });
    }
  }

  static async upsertManyJobs(jobs: CronnerJob[]) {
    for (const job of jobs) {
      await this.upsertJob(job);
    }
  }

  static async removeManyJobs(ids: string[]) {
    await Promise.all(ids.map((i) => this.removeJob(i)));
  }
}
