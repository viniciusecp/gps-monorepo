import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const reverseQuerySchema = z.object({
	lat: z.coerce.number().min(-90).max(90),
	lon: z.coerce.number().min(-180).max(180),
});

export async function reverseGeocode(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const parse = reverseQuerySchema.safeParse(request.query);

	if (!parse.success) {
		return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
	}

	const { lat, lon } = parse.data;
	const geocodeService = request.server.geocodeService;
	const result = await geocodeService.reverse(lat, lon);
	return reply.send(result);
}
