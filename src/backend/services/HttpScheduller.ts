import { MongoClient, type ObjectId } from "mongodb";
import { getEnv } from "../../utils/getEnv";
import { CronnerService } from "./Cronner";

export interface HttpScheduller {
	externalId: string;
	triggerType: "cron" | "date";
	excludeBeforeExecution: boolean;
	triggerValue: string;
	url: string;
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	headers: Record<string, string>;
	body: string;
}

type WithIdHttpScheduller = HttpScheduller & {
	_id: ObjectId;
};

const mongoClient = await MongoClient.connect(getEnv("MONGO_URI"), {
	authSource: "http-scheduller",
});

const db = mongoClient.db("http-scheduller");

const collection = db.collection<WithIdHttpScheduller>("http-scheduller");

function removeInternalId(httpScheduller: WithIdHttpScheduller) {
	const { _id, ...rest } = httpScheduller;
	return rest;
}

export class HttpSchedullerService {
	static async deleteMany(ids: string[]) {
		await collection.deleteMany({
			externalId: {
				$in: ids,
			},
		});
	}
	static async getAll() {
		const httpScheduller = await collection.find({}).toArray();
		return httpScheduller.map(removeInternalId);
	}
	static async createOrUpdateMany(httpScheduller: HttpScheduller[]) {
		for (const http of httpScheduller) {
			await collection.updateOne(
				{
					externalId: http.externalId,
				},
				{
					$set: http,
				},
				{
					upsert: true,
				},
			);
			await CronnerService.addJob({
				id: http.externalId,
				type: http.triggerType,
				triggerValue: http.triggerValue,
			});
		}
	}
	static async getById(id: string) {
		const httpScheduller = await collection.findOne({
			externalId: id,
		});
		return httpScheduller ? removeInternalId(httpScheduller) : null;
	}
	static async deleteById(id: string) {
		await collection.deleteOne({
			externalId: id,
		});
	}
}
