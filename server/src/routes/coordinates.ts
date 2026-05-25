import type { FastifyInstance } from "fastify";
import { getCoordinates, getHistory } from "../controllers/gps-controller";
import { authenticate } from "../middleware/auth";
import { validateParams, validateQuery } from "../middleware/validation";
import { getCoordinatesSchema } from "../validators/coordinates";
import { historyParamsSchema, historyQuerySchema } from "../validators/history";

export default async function gprmcRoutes(app: FastifyInstance) {
	app.get(
		"/gprmc/coordinates/:imei",
		{ preHandler: authenticate, preValidation: validateParams(getCoordinatesSchema) },
		getCoordinates,
	);

	app.get(
		"/gprmc/history/:imei",
		{
			preHandler: authenticate,
			preValidation: [validateParams(historyParamsSchema), validateQuery(historyQuerySchema)],
		},
		getHistory,
	);
}
