import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';

export type UserRole = 'admin' | 'owner' | 'customer';

export interface NewUserRow {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

// Kolom yang AMAN dikirim ke client (tanpa password_hash).
const publicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
};

export class UserRepository {
  async findAll(role?: UserRole) {
    const db = await getDb();
    return db
      .select(publicColumns)
      .from(users)
      .where(role !== undefined ? eq(users.role, role) : undefined)
      .orderBy(users.id);
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select(publicColumns).from(users).where(eq(users.id, id));
    return rows[0];
  }

  async findByEmail(email: string) {
    const db = await getDb();
    const rows = await db.select(publicColumns).from(users).where(eq(users.email, email));
    return rows[0];
  }

  async create(input: NewUserRow) {
    const db = await getDb();
    const rows = await db.insert(users).output().values(input);
    return rows[0];
  }
}