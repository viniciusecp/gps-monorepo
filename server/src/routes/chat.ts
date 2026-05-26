import type { FastifyInstance } from "fastify";
import { chat } from "../controllers/chat";

export default async function chatRoutes(app: FastifyInstance) {
	app.post("/chat", { preHandler: [app.authenticate] }, chat);
}
