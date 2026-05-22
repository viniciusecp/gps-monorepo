import { getDb } from "../db/connection";
import { gprmc, type Gprmc } from "../db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export class GprmcRepository {
	/** Get the last N coordinates for a given IMEI */
	async getLastCoordinates(imei: string, limit = 10): Promise<Gprmc[]> {
		const db = getDb();
		return db
			.select()
			.from(gprmc)
			.where(eq(gprmc.imei, imei))
			.orderBy(desc(gprmc.id))
			.limit(limit);
	}

	/** Get history within a date range for a given IMEI */
	async getHistory(imei: string, start: Date, end: Date): Promise<Gprmc[]> {
		const db = getDb();
		return db
			.select()
			.from(gprmc)
			.where(
				and(eq(gprmc.imei, imei), gte(gprmc.date, start), lte(gprmc.date, end)),
			)
			.orderBy(desc(gprmc.date));
	}
}
