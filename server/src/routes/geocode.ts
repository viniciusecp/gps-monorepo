import type { FastifyInstance } from "fastify";
import { reverseGeocode } from "../controllers/geocode-controller";

export default async function geocodeRoutes(app: FastifyInstance) {
	app.get("/geocode/reverse", reverseGeocode);
}
