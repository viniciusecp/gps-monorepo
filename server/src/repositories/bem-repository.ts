import { getDb } from "../db/connection";
import { bem, type Bem } from "../db/schema";
import { eq } from "drizzle-orm";

export class BemRepository {
	/**
	 * Find vehicles by cliente ID.
	 */
	async findByClienteId(clienteId: number): Promise<Bem[]> {
		const db = getDb();
		return db.select().from(bem).where(eq(bem.cliente, clienteId));
	}
}
