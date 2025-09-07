import axios from "axios";
import { Cron, scheduledJobs } from "croner";
import { HttpSchedullerService } from "./HttpScheduller";

interface CronnerJob {
	id: string;
	type: "cron" | "date";
	triggerValue: string;
}

export class CronnerService {
	static async addJob(job: CronnerJob) {
		const jobExists = CronnerService.checkJobExists(job.id);
		if (jobExists) {
			await CronnerService.removeJob(job.id);
		}
		new Cron(
			job.triggerValue,
			{
				name: job.id,
				timezone: "America/Sao_Paulo",
			},
			async () => {
				await CronnerService.processJob(job.id);
			},
		);
	}
	static checkJobExists(id: string) {
		return scheduledJobs.find((job) => job.name === id) !== undefined;
	}
	static async removeJob(id: string) {
		const jobExists = scheduledJobs.find((job) => job.name === id);
		if (jobExists) {
			jobExists.stop();
		}
	}
	static async processJob(id: string) {
		const scheduler = await HttpSchedullerService.getById(id);
		if (!scheduler) {
			return;
		}
		if (scheduler.excludeBeforeExecution) {
			await CronnerService.removeJob(id);
			await HttpSchedullerService.deleteById(id);
		}
		await axios.request({
			method: scheduler.method,
			url: scheduler.url,
			headers: scheduler.headers,
			data: scheduler.body,
		});
	}

	static async gracefulShutdown() {
		for (const job of scheduledJobs) {
			job.stop();
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
