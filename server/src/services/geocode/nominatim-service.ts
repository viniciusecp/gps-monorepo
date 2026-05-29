const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

interface NominatimResponse {
	display_name: string;
}

export class NominatimService {
	private baseUrl: string;
	private timeoutMs: number;

	constructor() {
		this.baseUrl = process.env.NOMINATIM_BASE_URL || NOMINATIM_BASE_URL;
		this.timeoutMs = 10_000;
	}

	async reverse(lat: number, lon: number): Promise<{ display_name: string }> {
		const url = `${this.baseUrl}/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					"User-Agent": "GPS-Monorepo/1.0 (mobile-app)",
				},
			});

			if (!response.ok) {
				throw new Error(
					`Nominatim API error: ${response.status} ${response.statusText}`,
				);
			}

			const data = (await response.json()) as NominatimResponse;

			if (!data.display_name) {
				throw new Error("No results found for the given coordinates");
			}

			return { display_name: data.display_name };
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Nominatim request timed out");
			}
			throw error;
		} finally {
			clearTimeout(timeout);
		}
	}
}
