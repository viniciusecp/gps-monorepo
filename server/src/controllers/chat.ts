import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const chatSchema = z.object({
	message: z.string().min(1, "Mensagem obrigatória"),
});

export async function chat(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const parse = chatSchema.safeParse(request.body);
	if (!parse.success) {
		return reply.status(400).send({ error: parse.error.flatten().fieldErrors });
	}

	const user = request.user as { id: number } | undefined;
	if (!user?.id) {
		return reply.status(401).send({ error: "Usuário não autenticado" });
	}

	const chatService = request.server.chatService;

	reply.raw.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
		"X-Accel-Buffering": "no",
	});

	try {
		for await (const event of chatService.processMessage(user.id, parse.data.message)) {
			const payload = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
			reply.raw.write(payload);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Erro interno";
		const payload = `event: error\ndata: ${JSON.stringify(message)}\n\n`;
		reply.raw.write(payload);
	} finally {
		reply.raw.end();
	}
}
