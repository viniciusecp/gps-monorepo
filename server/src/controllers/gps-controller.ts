import type { FastifyRequest, FastifyReply } from "fastify";
import { getCoordinatesSchema } from "../validators/coordinates";
import { historyParamsSchema } from "../validators/history";

export async function getCoordinates(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const parse = getCoordinatesSchema.safeParse(request.params);

	if (!parse.success) {
		return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
	}

	const gpsService = request.server.gpsService;
	const result = await gpsService.getLastCoordinates(parse.data.imei);
	return reply.send(result);
}

export async function getHistory(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const paramsParse = historyParamsSchema.safeParse(request.params);
	if (!paramsParse.success) {
		return reply.status(400).send({ error: paramsParse.error.flatten().fieldErrors });
	}

	const { startDate, endDate } = request.query as { startDate: string; endDate: string };
	const gpsService = request.server.gpsService;
	const result = await gpsService.getCoordinatesByDateRange(
		paramsParse.data.imei,
		startDate,
		endDate,
	);
	return reply.send(result);
}
