import { getDb } from "../db/connection";
import { cliente, type Cliente } from "../db/schema";
import { eq } from "drizzle-orm";

export class ClienteRepository {
	/**
	 * Find a cliente by email.
	 */
	async findByEmail(email: string): Promise<Cliente | undefined> {
		const db = getDb();
		const result = await db
			.select()
			.from(cliente)
			.where(eq(cliente.email, email))
			.limit(1);
		return result[0];
	}

	/**
	 * Find a cliente by id.
	 */
	async findById(id: number): Promise<Cliente | undefined> {
		const db = getDb();
		const result = await db
			.select()
			.from(cliente)
			.where(eq(cliente.id, id))
			.limit(1);
		return result[0];
	}
}
