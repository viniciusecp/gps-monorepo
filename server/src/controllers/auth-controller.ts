import type { FastifyRequest, FastifyReply } from "fastify";
import { loginSchema, refreshSchema } from "../validators/schemas";

export async function login(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const parse = loginSchema.safeParse(request.body);
	if (!parse.success) {
		return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
	}

	const { email, senha } = parse.data;
	const authService = request.server.authService;
	const user = await authService.authenticateUser(email, senha);

	if (!user) {
		return reply.status(401).send({ error: "Credenciais inválidas" });
	}

	const token = await reply.jwtSign(
		{ id: user.id, email: user.email },
		{ expiresIn: "15m" },
	);
	const refreshToken = await reply.jwtSign(
		{ id: user.id },
		{ expiresIn: "365d" },
	);

	return reply.send({
		user: { id: user.id, email: user.email, nome: user.nome },
		token,
		refreshToken,
	});
}

export async function refreshToken(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const parse = refreshSchema.safeParse(request.body);
	if (!parse.success) {
		return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
	}

	try {
		const decoded = await request.server.jwt.verify<{ id: number }>(
			parse.data.refreshToken,
		);
		const newToken = await reply.jwtSign(
			{ id: decoded.id },
			{ expiresIn: "15m" },
		);
		return reply.send({ token: newToken });
	} catch {
		return reply.status(401).send({ error: "Refresh token inválido" });
	}
}

