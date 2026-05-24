import type { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		await request.jwtVerify();
	} catch (_err) {
		return reply.status(401).send({ error: "Token inválido ou expirado" });
	}
}
