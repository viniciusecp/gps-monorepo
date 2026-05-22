import type { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		console.log('request', request.headers.authorization)
		await request.jwtVerify();
	} catch (_err) {
		return reply.status(401).send({ error: "Token inválido ou expirado" });
	}
}
