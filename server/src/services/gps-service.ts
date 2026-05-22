import { getDb } from "../db/connection";
import { gprmc } from "../db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
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

	/**
	 * Get history within a date range for a given IMEI.
	 */
	async getHistory(
		imei: string,
		dataInicio: string,
		horaInicio: string,
		dataFinal: string,
		horaFinal: string,
	) {
		const start = new Date(`${dataInicio}T${horaInicio}`);
		const end = new Date(`${dataFinal}T${horaFinal}`);

		const db = getDb();
		const rawData = await db
			.select()
			.from(gprmc)
			.where(
				and(
					eq(gprmc.imei, imei),
					gte(gprmc.date, start),
					lte(gprmc.date, end),
				),
			)
			.orderBy(desc(gprmc.date));
		return convertCoordinates(rawData as GprmcRow[]);
	}
}
