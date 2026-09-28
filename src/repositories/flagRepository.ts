import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { flags, reviews, users } from '../db/schema.ts';

export type FlagStatus = 'pending' | 'resolved' | 'dismissed';

// Kolom hasil JOIN FLAGS + REVIEWS + USERS (pelapor).
const flagColumns = {
  id: flags.id,
  reviewId: flags.reviewId,
  reviewComment: reviews.comment,
  reportedBy: flags.reportedBy,
  reporterName: users.name,
  reason: flags.reason,
  status: flags.status,
  createdAt: flags.createdAt,
};

export class FlagRepository {
  async findAll(status?: FlagStatus) {
    const db = await getDb();
    return db
      .select(flagColumns)
      .from(flags)
      .innerJoin(reviews, eq(flags.reviewId, reviews.id))
      .innerJoin(users, eq(flags.reportedBy, users.id))
      .where(status !== undefined ? eq(flags.status, status) : undefined)
      .orderBy(flags.id);
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db
      .select(flagColumns)
      .from(flags)
      .innerJoin(reviews, eq(flags.reviewId, reviews.id))
      .innerJoin(users, eq(flags.reportedBy, users.id))
      .where(eq(flags.id, id));
    return rows[0];
  }

  async updateStatus(id: number, status: FlagStatus) {
    const db = await getDb();
    const rows = await db
      .update(flags)
      .set({ status })
      .where(eq(flags.id, id))
      .output();
    return rows[0];
  }
}