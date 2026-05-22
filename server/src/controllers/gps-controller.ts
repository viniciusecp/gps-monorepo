import type { FastifyRequest, FastifyReply } from "fastify";
import { getCoordinatesSchema, historyQuerySchema } from "../validators/coordinates";
import type { GpsService } from "../services/gps-service";

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

export async function getHistoryController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { imei } = request.params as { imei: string };
	const parse = historyQuerySchema.safeParse(request.query);

	if (!parse.success) {
		return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
	}

	const { dataInicio, horaInicio, dataFinal, horaFinal } = parse.data;
	const gpsService = request.server.gpsService as GpsService;
	const result = await gpsService.getHistory(
		imei,
		dataInicio,
		horaInicio,
		dataFinal,
		horaFinal,
	);
	return reply.send(result);
}
