import { createHash } from "node:crypto";
import { eq, or, and } from "drizzle-orm";
import { cliente, type Cliente } from "../db/schema";
import { getDb } from "../db/connection";

/**
 * Service handling authentication related operations (cliente entity).
 */
export class AuthService {
	/**
	 * Authenticate a user by email/apelido and password.
	 * Returns the matching cliente record or null.
	 */
	async authenticateUser(email: string, senha: string): Promise<Cliente | null> {
		const senhaMd5 = createHash("md5").update(senha).digest("hex");
		const db = getDb();
		const users = await db
			.select()
			.from(cliente)
			.where(
				and(
					or(eq(cliente.email, email), eq(cliente.apelido, email)),
					eq(cliente.senha, senhaMd5),
				),
			)
			.limit(1);
		if (users.length === 0) return null;
		return users[0];
	}
}
