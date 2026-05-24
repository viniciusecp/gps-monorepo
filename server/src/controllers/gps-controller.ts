import type { FastifyRequest, FastifyReply } from "fastify";
import { getCoordinatesSchema } from "../validators/coordinates";

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
