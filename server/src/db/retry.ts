import type { MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "./schema";

function isConnectionReset(error: unknown): boolean {
	return error instanceof Error && error.message.includes("read ECONNRESET");
}

function createQueryProxy<T>(obj: T): T {
	if (!obj || typeof obj !== "object") {
		return obj;
	}

	return new Proxy(obj, {
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);

			if (typeof value !== "function") {
				return value;
			}

			if (prop === "execute") {
				return async (...args: unknown[]) => {
					try {
						return await Reflect.apply(value, target, args);
					} catch (error) {
						if (isConnectionReset(error)) {
							return await Reflect.apply(value, target, args);
						}
						throw error;
					}
				};
			}

			if (prop === "then") {
				return (onFulfilled?: unknown, onRejected?: unknown) => {
					const wrappedOnRejected = (error: unknown) => {
						if (isConnectionReset(error)) {
							return (target as unknown as { execute(...args: unknown[]): Promise<unknown> }).execute().then(onFulfilled as ((value: unknown) => unknown) | null | undefined);
						}
						if (onRejected) return (onRejected as (...args: unknown[]) => unknown)(error);
						throw error;
					};
					return value.call(target, onFulfilled, wrappedOnRejected);
				};
			}

			return (...args: unknown[]) => {
				const result = Reflect.apply(value, target, args);
				return createQueryProxy(result);
			};
		},
	});
}

export function createRetryDb(
	db: MySql2Database<typeof schema>,
): MySql2Database<typeof schema> {
	return createQueryProxy(db);
}
