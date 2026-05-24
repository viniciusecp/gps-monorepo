import { getDb } from "../db/connection";
import { gprmc, type Gprmc } from "../db/schema";
import { eq, desc } from "drizzle-orm";

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
}
