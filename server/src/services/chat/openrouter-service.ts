const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export interface OpenRouterMessage {
	role: "system" | "user" | "assistant" | "tool";
	content: string | null;
	tool_calls?: Array<{
		id: string;
		type: "function";
		function: {
			name: string;
			arguments: string;
		};
	}>;
	tool_call_id?: string;
	name?: string;
}

export interface OpenRouterTool {
	type: "function";
	function: {
		name: string;
		description: string;
		parameters: Record<string, unknown>;
	};
}

interface StreamChunk {
	type: "chunk";
	content: string;
	done: boolean;
}

interface ToolCallChunk {
	type: "tool_calls";
	tool_calls: Array<{
		index: number;
		id: string;
		type: "function";
		function: {
			name: string;
			arguments: string;
		};
	}>;
}

interface ErrorChunk {
	type: "error";
	message: string;
	status?: number;
}

type SSEResult = StreamChunk | ToolCallChunk | ErrorChunk;

export class OpenRouterService {
	private apiKey: string;
	private model: string;
	private baseUrl: string;
	private timeoutMs: number;

	constructor() {
		this.apiKey = process.env.OPENROUTER_API_KEY || "";
		this.model = process.env.OPENROUTER_MODEL || "openrouter/free";
		this.baseUrl = process.env.OPENROUTER_BASE_URL || OPENROUTER_BASE_URL;
		this.timeoutMs = 60_000;
	}

	async *streamChat(
		messages: OpenRouterMessage[],
		tools?: OpenRouterTool[],
	): AsyncGenerator<SSEResult> {
		const body: Record<string, unknown> = {
			model: this.model,
			messages,
			stream: true,
		};

		if (tools && tools.length > 0) {
			body.tools = tools;
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

		try {
			const response = await fetch(`${this.baseUrl}/chat/completions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.apiKey}`,
					"HTTP-Referer": "https://rastroutions.app",
					"X-Title": "Rastroutions",
				},
				body: JSON.stringify(body),
				signal: controller.signal,
			});

			if (!response.ok) {
				const body = await response.text().catch(() => "");
				yield {
					type: "error",
					message: `OpenRouter API error: ${response.status} ${response.statusText} - ${body}`,
					status: response.status,
				};
				return;
			}

			const reader = response.body?.getReader();
			if (!reader) {
				yield { type: "error", message: "Response body is not readable" };
				return;
			}

			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.startsWith("data: ")) continue;
					const data = line.slice(6).trim();
					if (data === "[DONE]") {
						yield { type: "chunk", content: "", done: true };
						return;
					}

					try {
						const parsed = JSON.parse(data);
						const delta = parsed.choices?.[0]?.delta;

						if (delta?.tool_calls) {
							yield {
								type: "tool_calls",
								tool_calls: delta.tool_calls.map((tc: { index?: number; id?: string; function?: { name?: string; arguments?: string } }) => ({
									index: tc.index ?? 0,
									id: tc.id || "",
									type: "function" as const,
									function: {
										name: tc.function?.name || "",
										arguments: tc.function?.arguments || "",
									},
								})),
							};
						}

						if (delta?.content) {
							yield { type: "chunk", content: delta.content, done: false };
						}
					} catch {
						// skip malformed JSON lines
					}
				}
			}

			yield { type: "chunk", content: "", done: true };
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				yield { type: "error", message: "Request timed out", status: 408 };
			} else {
				const message = error instanceof Error ? error.message : "Unknown error";
				yield { type: "error", message };
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	async chat(
		messages: OpenRouterMessage[],
		tools?: OpenRouterTool[],
	): Promise<{
		content: string | null;
		tool_calls?: OpenRouterMessage["tool_calls"];
	}> {
		const body: Record<string, unknown> = {
			model: this.model,
			messages,
			stream: false,
		};

		if (tools && tools.length > 0) {
			body.tools = tools;
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

		try {
			const response = await fetch(`${this.baseUrl}/chat/completions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.apiKey}`,
					"HTTP-Referer": "https://rastroutions.app",
					"X-Title": "Rastroutions",
				},
				body: JSON.stringify(body),
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(
					`OpenRouter API error: ${response.status} ${response.statusText}`,
				);
			}

			const result = await response.json() as { choices?: Array<{ message?: { content?: string | null; tool_calls?: OpenRouterMessage["tool_calls"] } }> };
			const choice = result.choices?.[0]?.message;

			return {
				content: choice?.content || null,
				tool_calls: choice?.tool_calls || undefined,
			};
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Request timed out");
			}
			throw error;
		} finally {
			clearTimeout(timeout);
		}
	}
}
