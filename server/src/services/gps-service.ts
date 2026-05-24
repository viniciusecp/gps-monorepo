import { getDb } from "../db/connection";
import { gprmc } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { convertCoordinates } from "../utils/coordinates";

type GprmcRow = {
	date: Date;
	latitudeDecimalDegrees: string;
	longitudeDecimalDegrees: string;
	latitudeHemisphere: string;
	longitudeHemisphere: string;
	speed: number;
};

/**
 * Service for GPS-related operations (gprmc entity).
 */
export class GpsService {
	/**
	 * Get the last N coordinates for a given IMEI.
	 */
	async getLastCoordinates(imei: string, limit = 10) {
		const db = getDb();
		const rawData = await db
			.select()
			.from(gprmc)
			.where(eq(gprmc.imei, imei))
			.orderBy(desc(gprmc.id))
			.limit(limit);
		return convertCoordinates(rawData as GprmcRow[]);
	}
}
