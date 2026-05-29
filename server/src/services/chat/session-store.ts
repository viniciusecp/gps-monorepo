export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
	role: ChatRole;
	content: string | null;
	tool_call_id?: string;
	name?: string;
	tool_calls?: Array<{
		id: string;
		type: "function";
		function: {
			name: string;
			arguments: string;
		};
	}>;
}

export interface ChatSession {
	userId: string;
	messages: ChatMessage[];
	createdAt: Date;
	lastActivity: Date;
	metadata?: Record<string, unknown>;
}

export class ChatSessionStore {
	private sessions: Map<string, ChatSession>;
	private ttlMs: number;
	private cleanupInterval: ReturnType<typeof setInterval> | null;

	constructor(ttlMinutes = 30) {
		this.sessions = new Map();
		this.ttlMs = ttlMinutes * 60 * 1000;
		this.cleanupInterval = null;
	}

	getSession(userId: string): ChatSession {
		let session = this.sessions.get(userId);
		if (!session) {
			session = {
				userId,
				messages: [],
				createdAt: new Date(),
				lastActivity: new Date(),
			};
			this.sessions.set(userId, session);
		}
		session.lastActivity = new Date();
		return session;
	}

	addMessage(userId: string, role: ChatRole, content: string | null): void {
		const session = this.getSession(userId);
		session.messages.push({ role, content });
		session.lastActivity = new Date();
	}

	getHistory(userId: string): ChatMessage[] {
		const session = this.getSession(userId);
		return session.messages;
	}

	destroySession(userId: string): void {
		this.sessions.delete(userId);
	}

	clearExpiredSessions(): void {
		const now = Date.now();
		for (const [userId, session] of this.sessions) {
			if (now - session.lastActivity.getTime() > this.ttlMs) {
				this.sessions.delete(userId);
			}
		}
	}

	startCleanup(intervalMs?: number): void {
		if (this.cleanupInterval) return;
		this.cleanupInterval = setInterval(
			() => this.clearExpiredSessions(),
			intervalMs ?? Math.min(this.ttlMs / 2, 5 * 60 * 1000),
		);
		this.cleanupInterval.unref();
	}

	stopCleanup(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
	}
}
