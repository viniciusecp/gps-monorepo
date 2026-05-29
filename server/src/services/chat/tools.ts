import type { GpsService } from "../gps-service";
import type { BemService } from "../bem-service";
import type { NominatimService } from "../geocode/nominatim-service";

export interface ToolDefinition {
	type: "function";
	function: {
		name: string;
		description: string;
		parameters: Record<string, unknown>;
	};
}

export interface ToolHandler {
	definition: ToolDefinition;
	execute: (
		args: Record<string, unknown>,
		userId: number,
		services: { gpsService: GpsService; bemService: BemService; geocodeService: NominatimService },
	) => Promise<string>;
}

const MS_BRT_OFFSET = 3 * 60 * 60 * 1000;

function brtDate(date: Date): Date {
	return new Date(date.getTime() + MS_BRT_OFFSET);
}

async function getVehicleImei(
	userId: number,
	imei: string | undefined,
	bemService: BemService,
): Promise<string | null> {
	if (!imei) return null;
	const vehicles = await bemService.getUserVehicles(userId);
	const vehicle = vehicles.find((v) => v.imei === imei);
	return vehicle ? imei : null;
}

export const tools: ToolHandler[] = [
	{
		definition: {
			type: "function",
			function: {
				name: "list_vehicles",
				description: "List all vehicles the user has access to with their IMEI and name",
				parameters: {
					type: "object",
					properties: {},
					required: [],
				},
			},
		},
		async execute(_args, userId, { bemService }) {
			const vehicles = await bemService.getUserVehicles(userId);
			if (vehicles.length === 0) {
				return "Você não possui veículos cadastrados.";
			}
			return vehicles
				.map(
					(v, i) =>
						`${i + 1}. **${v.name}** — IMEI: ${v.imei}${v.identificacao ? ` (${v.identificacao})` : ""}`,
				)
				.join("\n");
		},
	},
	{
		definition: {
			type: "function",
			function: {
				name: "get_vehicle_current_location",
				description: "Get the current/last known location of a vehicle by its IMEI number",
				parameters: {
					type: "object",
					properties: {
						imei: {
							type: "string",
							description: "The 15-digit IMEI of the vehicle",
						},
					},
					required: ["imei"],
				},
			},
		},
		async execute(args, userId, { gpsService, bemService }) {
			const imei = await getVehicleImei(userId, args.imei as string, bemService);
			if (!imei) {
				return "Veículo não encontrado ou você não tem acesso a ele.";
			}
			const result = await gpsService.getLastCoordinates(imei, 1);
			const coords = result.coordinates;
			if (!coords || coords.length === 0) {
				return "Nenhuma coordenada encontrada para este veículo.";
			}
			const c = coords[0];
			const lat = c.latitudeDecimalDegrees;
			const lng = c.longitudeDecimalDegrees;
			const speed = c.speed ? `${c.speed.toFixed(1)} km/h` : "N/A";
			const date = c.date ? brtDate(new Date(c.date)).toLocaleString("pt-BR") : "N/A";
			return (
				`**Localização atual do veículo**\n` +
				`Latitude: ${lat}°\n` +
				`Longitude: ${lng}°\n` +
				`Velocidade: ${speed}\n` +
				`Última atualização: ${date}`
			);
		},
	},
	{
		definition: {
			type: "function",
			function: {
				name: "get_vehicle_history",
				description:
					"Get the position history of a vehicle within a date range. Use this to answer questions about where a vehicle was at a specific time or period. For 'where was my car at day X at time Y' questions, use the specificTime parameter.",
				parameters: {
					type: "object",
					properties: {
						imei: {
							type: "string",
							description: "The 15-digit IMEI of the vehicle",
						},
						startDate: {
							type: "string",
							description:
								"Start date in ISO format (YYYY-MM-DDTHH:mm:ssZ) or YYYY-MM-DD",
						},
						endDate: {
							type: "string",
							description:
								"End date in ISO format (YYYY-MM-DDTHH:mm:ssZ) or YYYY-MM-DD",
						},
						specificTime: {
							type: "string",
							description:
								"Optional. An ISO timestamp to find the closest GPS point to that moment. Use this for questions like 'onde estava no dia X às Y horas'. Example: '2026-05-28T14:30:00Z'",
						},
					},
					required: ["imei", "startDate", "endDate"],
				},
			},
		},
		async execute(args, userId, { gpsService, bemService, geocodeService }) {
			const imei = await getVehicleImei(userId, args.imei as string, bemService);
			if (!imei) {
				return "Veículo não encontrado ou você não tem acesso a ele.";
			}
			const startDate = args.startDate as string;
			const endDate = args.endDate as string;
			const specificTime = args.specificTime as string | undefined;

			let queryStart = startDate;
			let queryEnd = endDate;

			if (specificTime) {
				const t = new Date(specificTime).getTime();
				const fiveMin = 5 * 60 * 1000;
				queryStart = new Date(t - fiveMin).toISOString();
				queryEnd = new Date(t + fiveMin).toISOString();
			}

			const result = await gpsService.getCoordinatesByDateRange(imei, queryStart, queryEnd);
			const coords = result.coordinates;
			if (!coords || coords.length === 0) {
				return "Nenhum histórico encontrado para o período informado.";
			}

			const total = coords.length;
			const maxSpeed = Math.max(...coords.map((c) => c.speed || 0));
			const avgSpeed = coords.reduce((sum, c) => sum + (c.speed || 0), 0) / total;
			const first = coords[0];
			const last = coords[coords.length - 1];

			if (specificTime) {
				const targetMs = new Date(specificTime).getTime();
				let closest = coords[0];
				let closestDiff = Math.abs(brtDate(new Date(closest.date)).getTime() - targetMs);

				for (const c of coords) {
					const diff = Math.abs(brtDate(new Date(c.date)).getTime() - targetMs);
					if (diff < closestDiff) {
						closest = c;
						closestDiff = diff;
					}
				}

				let address = "";
				try {
					const geo = await geocodeService.reverse(closest.latitudeDecimalDegrees, closest.longitudeDecimalDegrees);
					address = `\nEndereço: ${geo.display_name}`;
				} catch {
					address = "";
				}

				const diffMinutes = Math.round(closestDiff / 60000);
				return (
					`**Localização do veículo em ${brtDate(new Date(specificTime)).toLocaleString("pt-BR")}**\n` +
					`Ponto mais próximo: ${closest.latitudeDecimalDegrees}°, ${closest.longitudeDecimalDegrees}°\n` +
					`(diferença de aproximadamente ${diffMinutes} minuto(s))\n` +
					`Velocidade: ${closest.speed ? `${closest.speed.toFixed(1)} km/h` : "N/A"}\n` +
					`Horário do registro: ${brtDate(new Date(closest.date)).toLocaleString("pt-BR")}` +
					address
				);
			}

			return (
				`**Histórico do veículo (${new Date(startDate).toLocaleDateString("pt-BR")} - ${new Date(endDate).toLocaleDateString("pt-BR")})**\n` +
				`Total de pontos registrados: ${total}\n` +
				`Velocidade máxima: ${maxSpeed.toFixed(1)} km/h\n` +
				`Velocidade média: ${avgSpeed.toFixed(1)} km/h\n` +
				`Primeira coordenada: ${first.latitudeDecimalDegrees}°, ${first.longitudeDecimalDegrees}° em ${brtDate(new Date(first.date)).toLocaleString("pt-BR")}\n` +
				`Última coordenada: ${last.latitudeDecimalDegrees}°, ${last.longitudeDecimalDegrees}° em ${brtDate(new Date(last.date)).toLocaleString("pt-BR")}`
			);
		},
	},
	{
		definition: {
			type: "function",
			function: {
				name: "reverse_geocode",
				description: "Get the street address for a latitude/longitude coordinate. Use this to show the user where a location is (street name, neighborhood, city). ONLY call this for a single point — never for lists.",
				parameters: {
					type: "object",
					properties: {
						lat: {
							type: "number",
							description: "Latitude (-90 to 90)",
						},
						lon: {
							type: "number",
							description: "Longitude (-180 to 180)",
						},
					},
					required: ["lat", "lon"],
				},
			},
		},
		async execute(args, _userId, { geocodeService }) {
			const lat = args.lat as number;
			const lon = args.lon as number;
			if (typeof lat !== "number" || typeof lon !== "number") {
				return "Parâmetros inválidos. Forneça lat e lon como números.";
			}
			try {
				const result = await geocodeService.reverse(lat, lon);
				return `Endereço encontrado: ${result.display_name}`;
			} catch {
				return "Serviço de geolocalização indisponível no momento.";
			}
		},
	},
	{
		definition: {
			type: "function",
			function: {
				name: "get_vehicle_speed",
				description: "Get the current speed of a vehicle from its last GPS reading",
				parameters: {
					type: "object",
					properties: {
						imei: {
							type: "string",
							description: "The 15-digit IMEI of the vehicle",
						},
					},
					required: ["imei"],
				},
			},
		},
		async execute(args, userId, { gpsService, bemService }) {
			const imei = await getVehicleImei(userId, args.imei as string, bemService);
			if (!imei) {
				return "Veículo não encontrado ou você não tem acesso a ele.";
			}
			const result = await gpsService.getLastCoordinates(imei, 1);
			const coords = result.coordinates;
			if (!coords || coords.length === 0) {
				return "Nenhuma informação de velocidade disponível para este veículo.";
			}
			const c = coords[0];
			const speed = c.speed || c.speed === 0 ? `${c.speed.toFixed(1)} km/h` : "N/A";
			const date = brtDate(new Date(c.date));
			return `**Velocidade do veículo**: ${speed}\nRegistrada em: ${date.toLocaleString("pt-BR")}`;
		},
	},
];

export function getToolDefinitions(): ToolDefinition[] {
	return tools.map((t) => t.definition);
}

export async function executeTool(
	name: string,
	args: Record<string, unknown>,
	userId: number,
	services: { gpsService: GpsService; bemService: BemService; geocodeService: NominatimService },
): Promise<string> {
	const tool = tools.find((t) => t.definition.function.name === name);
	if (!tool) {
		return `Ferramenta "${name}" não encontrada.`;
	}
	return tool.execute(args, userId, services);
}
