import fastify from "fastify";
import type {
	FastifyReply,
	FastifyRequest,
} from "fastify";
import fjwt from "@fastify/jwt";
import authRoutes from "./routes/auth";
import gprmcRoutes from "./routes/coordinates";
import vehiclesRoutes from "./routes/vehicles";
import chatRoutes from "./routes/chat";
import geocodeRoutes from "./routes/geocode";
import { AuthService } from "./services/auth-service";
import { GpsService } from "./services/gps-service";
import { BemService } from "./services/bem-service";
import { ChatSessionStore } from "./services/chat/session-store";
import { OpenRouterService } from "./services/chat/openrouter-service";
import { ChatService } from "./services/chat/chat-service";
import { NominatimService } from "./services/geocode/nominatim-service";
import { registerErrorHandler } from "./middleware/errorHandler";
import { AppError } from "./errors/AppError";

declare module "fastify" {
	interface FastifyInstance {
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply,
		) => Promise<void>;
		authService: AuthService;
		gpsService: GpsService;
		bemService: BemService;
		chatSessionStore: ChatSessionStore;
		openrouterService: OpenRouterService;
		chatService: ChatService;
		geocodeService: NominatimService;
	}
}

export async function buildApp() {
	const app = fastify({ logger: true });

	app.register(fjwt, {
		secret: process.env.JWT_SECRET || "supersecretjwtkeychangemeinprod",
	});

	const authService = new AuthService();
	const gpsService = new GpsService();
	const bemService = new BemService();
	const chatSessionStore = new ChatSessionStore();
	const openrouterService = new OpenRouterService();
	const geocodeService = new NominatimService();
	const chatService = new ChatService(
		chatSessionStore,
		openrouterService,
		gpsService,
		bemService,
		geocodeService,
	);

	app.decorate("authenticate", async (request: FastifyRequest, _reply: FastifyReply) => {
		try {
			await request.jwtVerify();
		} catch (_err) {
			throw new AppError("Token inválido ou expirado", 401);
		}
	});
	app.decorate("authService", authService);
	app.decorate("gpsService", gpsService);
	app.decorate("bemService", bemService);
	app.decorate("chatSessionStore", chatSessionStore);
	app.decorate("openrouterService", openrouterService);
	app.decorate("chatService", chatService);
	app.decorate("geocodeService", geocodeService);
	chatSessionStore.startCleanup();

	app.register(authRoutes, { prefix: "/api" });
	app.register(gprmcRoutes, { prefix: "/api" });
	app.register(vehiclesRoutes, { prefix: "/api" });
	app.register(chatRoutes, { prefix: "/api" });
	app.register(geocodeRoutes, { prefix: "/api" });

	await registerErrorHandler(app);
	return app;
}
