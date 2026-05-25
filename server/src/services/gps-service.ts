import { getDb } from "../db/connection";
import { gprmc } from "../db/schema";
import { eq, desc, and, gte, lte, asc } from "drizzle-orm";
import { convertCoordinates } from "../utils/coordinates";

const MS_UTC_MINUS_3 = -3 * 60 * 60 * 1000;

type GprmcRow = {
	date: Date;
	latitudeDecimalDegrees: string;
	longitudeDecimalDegrees: string;
	latitudeHemisphere: string;
	longitudeHemisphere: string;
	speed: number;
};

function adjustToUtcMinus3(date: Date): Date {
	return new Date(date.getTime() + MS_UTC_MINUS_3);
}

export class GpsService {
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

	async getCoordinatesByDateRange(imei: string, startDate: string, endDate: string) {
		const db = getDb();
		const rawData = await db
			.select()
			.from(gprmc)
			.where(
				and(
					eq(gprmc.imei, imei),
					gte(gprmc.date, adjustToUtcMinus3(new Date(startDate))),
					lte(gprmc.date, adjustToUtcMinus3(new Date(endDate))),
				),
			)
			.orderBy(asc(gprmc.date));
		return convertCoordinates(rawData as GprmcRow[]);
	}
}
