import type { FastifyInstance } from "fastify";
import { getCoordinates } from "../controllers/gps-controller";
import { authenticate } from "../middleware/auth";
import { validateParams } from "../middleware/validation";
import { getCoordinatesSchema } from "../validators/coordinates";

export default async function gprmcRoutes(app: FastifyInstance) {
	app.get(
		"/gprmc/coordinates/:imei",
		{ preHandler: authenticate, preValidation: validateParams(getCoordinatesSchema) },
		getCoordinates,
	);
}
