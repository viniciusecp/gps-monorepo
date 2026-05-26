import type { GpsService } from "../gps-service";
import type { BemService } from "../bem-service";

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
		services: { gpsService: GpsService; bemService: BemService },
	) => Promise<string>;
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
			const speed = c.speed ? `${c.speed.toFixed(1)} mph` : "N/A";
			const date = c.date ? new Date(c.date).toLocaleString("pt-BR") : "N/A";
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
					"Get the position history of a vehicle within a date range. Use this to answer questions about where a vehicle was at a specific time or period.",
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
					},
					required: ["imei", "startDate", "endDate"],
				},
			},
		},
		async execute(args, userId, { gpsService, bemService }) {
			const imei = await getVehicleImei(userId, args.imei as string, bemService);
			if (!imei) {
				return "Veículo não encontrado ou você não tem acesso a ele.";
			}
			const startDate = args.startDate as string;
			const endDate = args.endDate as string;
			const result = await gpsService.getCoordinatesByDateRange(imei, startDate, endDate);
			const coords = result.coordinates;
			if (!coords || coords.length === 0) {
				return "Nenhum histórico encontrado para o período informado.";
			}
			const total = coords.length;
			const first = coords[0];
			const last = coords[coords.length - 1];
			const avgSpeed =
				coords.reduce((sum, c) => sum + (c.speed || 0), 0) / total;
			return (
				`**Histórico do veículo (${new Date(startDate).toLocaleDateString("pt-BR")} - ${new Date(endDate).toLocaleDateString("pt-BR")})**\n` +
				`Total de pontos registrados: ${total}\n` +
				`Primeira coordenada: ${first.latitudeDecimalDegrees}°, ${first.longitudeDecimalDegrees}° em ${new Date(first.date).toLocaleString("pt-BR")}\n` +
				`Última coordenada: ${last.latitudeDecimalDegrees}°, ${last.longitudeDecimalDegrees}° em ${new Date(last.date).toLocaleString("pt-BR")}\n` +
				`Velocidade média: ${avgSpeed.toFixed(1)} mph`
			);
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
			const speed = c.speed || c.speed == 0 ? `${c.speed.toFixed(1)} km/h` : "N/A";
			const date = new Date(c.date);
			date.setTime(date.getTime() + (3 * 60 * 60 * 1000));
			return `**Velocidade do veículo**: ${speed}\nRegistrada em: ${date}`;
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
	services: { gpsService: GpsService; bemService: BemService },
): Promise<string> {
	const tool = tools.find((t) => t.definition.function.name === name);
	if (!tool) {
		return `Ferramenta "${name}" não encontrada.`;
	}
	return tool.execute(args, userId, services);
}
