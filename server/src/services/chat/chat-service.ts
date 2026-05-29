import type { ChatSessionStore } from "./session-store";
import type { OpenRouterService } from "./openrouter-service";
import type { GpsService } from "../gps-service";
import type { BemService } from "../bem-service";
import type { NominatimService } from "../geocode/nominatim-service";
import { getToolDefinitions, executeTool } from "./tools";

const BASE_PROMPT = `Você é um assistente especializado em consulta de veículos de rastreamento.
Você tem acesso a ferramentas que permitem consultar dados reais de veículos do usuário.
Responda sempre em português brasileiro de forma clara e objetiva.
Use as ferramentas disponíveis para buscar informações quando necessário.
Se o usuário perguntar algo que não pode ser respondido com os dados disponíveis, informe educadamente.
Nenhuma interação fora desse escopo deve ser respondida.

REGRAS PARA REVERSE GEOCODE:
Use a ferramenta reverse_geocode APENAS quando estiver se referindo a um ÚNICO ponto específico (uma localização). NÃO use para listas, múltiplas coordenadas, ou pontos de histórico. O serviço tem limite de taxa e só deve ser chamado para o ponto principal que o usuário está perguntando.

REGRAS PARA CONSULTA POR DATA/HORA ESPECÍFICA:
Para perguntas como "onde estava meu carro no dia X às Y horas", use get_vehicle_history com o parâmetro specificTime preenchido com a data/hora desejada em formato ISO. Exemplo: specificTime="2026-05-28T14:30:00Z". Não use specificTime para períodos — use startDate e endDate para ranges.`;

function buildSystemPrompt(vehicleCount: number, firstVehicle?: { name: string; imei: string }): string {
	if (vehicleCount === 0) {
		return BASE_PROMPT;
	}

	if (vehicleCount === 1 && firstVehicle) {
		return (
			BASE_PROMPT +
			`\n\nCONTEXTO DO USUÁRIO:\nVocê tem 1 veículo cadastrado: ${firstVehicle.name} (IMEI: ${firstVehicle.imei})\nUse este IMEI automaticamente nas consultas — não pergunte qual veículo.\nQuando o usuário disser "meu carro" ou "meu veículo", refira-se a este.`
		);
	}

	return (
		BASE_PROMPT +
		`\n\nCONTEXTO DO USUÁRIO:\nVocê tem ${vehicleCount} veículos cadastrados. Use list_vehicles para listá-los.\nPergunte ao usuário qual veículo ele quer consultar antes de usar as ferramentas.`
	);
}

export interface SSEEvent {
	event: "token" | "tool_call" | "error" | "done";
	data: string;
}

export class ChatService {
	private sessionStore: ChatSessionStore;
	private openrouterService: OpenRouterService;
	private gpsService: GpsService;
	private bemService: BemService;
	private geocodeService: NominatimService;

	constructor(
		sessionStore: ChatSessionStore,
		openrouterService: OpenRouterService,
		gpsService: GpsService,
		bemService: BemService,
		geocodeService: NominatimService,
	) {
		this.sessionStore = sessionStore;
		this.openrouterService = openrouterService;
		this.gpsService = gpsService;
		this.bemService = bemService;
		this.geocodeService = geocodeService;
	}

	async *processMessage(
		userId: number,
		message: string,
	): AsyncGenerator<SSEEvent> {
		const session = this.sessionStore.getSession(String(userId));

		if (session.messages.length === 0) {
			const vehicles = await this.bemService.getUserVehicles(userId);
			const firstVehicle = vehicles[0];
			const prompt = buildSystemPrompt(
				vehicles.length,
				firstVehicle ? { name: firstVehicle.name ?? "Veículo", imei: firstVehicle.imei } : undefined,
			);

			session.messages.push({
				role: "system",
				content: prompt,
			});
		}

		session.messages.push({ role: "user", content: message });

		const tools = getToolDefinitions();

		let toolCallDepth = 0;
		const maxToolCallDepth = 5;

		while (toolCallDepth < maxToolCallDepth) {
			const stream = this.openrouterService.streamChat(
				session.messages,
				tools,
			);

			let fullContent = "";
			let toolCalls: Array<{
				index: number;
				id: string;
				type: "function";
				function: { name: string; arguments: string };
			}> | undefined;

			for await (const chunk of stream) {
				if (chunk.type === "error") {
					yield { event: "error", data: chunk.message };
					return;
				}

				if (chunk.type === "chunk") {
					if (chunk.done) break;
					fullContent += chunk.content;
					yield { event: "token", data: chunk.content };
				}

				if (chunk.type === "tool_calls") {
					toolCalls = toolCalls || [];
					for (const tc of chunk.tool_calls) {
						const existing = toolCalls.find((t) => t.index === tc.index);
						if (existing) {
							existing.function.arguments += tc.function.arguments;
							if (tc.function.name) existing.function.name = tc.function.name;
							if (tc.id) existing.id = tc.id;
						} else {
							toolCalls.push(tc);
						}
					}
				}
			}

			if (toolCalls && toolCalls.length > 0) {
				const cleanToolCalls = toolCalls.map(({ index: _, ...rest }) => rest);
				session.messages.push({
					role: "assistant",
					content: fullContent || null,
					tool_calls: cleanToolCalls,
				});

				for (const tc of toolCalls) {
					yield { event: "tool_call", data: tc.function.name };

					const args = JSON.parse(tc.function.arguments || "{}");
					const result = await executeTool(tc.function.name, args, userId, {
						gpsService: this.gpsService,
						bemService: this.bemService,
						geocodeService: this.geocodeService,
					});

					session.messages.push({
						role: "tool",
						tool_call_id: tc.id,
						name: tc.function.name,
						content: result,
					});
				}

				toolCallDepth++;
				toolCalls = undefined;
			} else {
				session.messages.push({
					role: "assistant",
					content: fullContent || null,
				});
				break;
			}
		}

		yield { event: "done", data: "" };
	}
}
