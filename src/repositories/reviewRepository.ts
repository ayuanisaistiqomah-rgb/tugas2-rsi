import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { reviews, users, stalls } from '../db/schema.ts';

export interface CreateReviewInput {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string | null;
}

// Kolom hasil JOIN REVIEWS + USERS + STALLS.
const reviewColumns = {
  id: reviews.id,
  stallId: reviews.stallId,
  stallName: stalls.name,
  userId: reviews.userId,
  userName: users.name,
  rating: reviews.rating,
  comment: reviews.comment,
  likeCount: reviews.likeCount,
  createdAt: reviews.createdAt,
};

export class ReviewRepository {
  // JOIN: setiap review membawa nama user & nama warung.
  async findAllWithUser(stallId?: number) {
    const db = await getDb();
    return db
      .select(reviewColumns)
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(stalls, eq(reviews.stallId, stalls.id))
      .where(stallId !== undefined ? eq(reviews.stallId, stallId) : undefined)
      .orderBy(reviews.id);
  }

  async findByIdWithUser(id: number) {
    const db = await getDb();
    const rows = await db
      .select(reviewColumns)
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(stalls, eq(reviews.stallId, stalls.id))
      .where(eq(reviews.id, id));
    return rows[0];
  }

  async findByUserAndStall(userId: number, stallId: number) {
    const db = await getDb();
    const rows = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.stallId, stallId)));
    return rows[0];
  }

  async create(input: CreateReviewInput) {
    const db = await getDb();
    const rows = await db
      .insert(reviews)
      .output()
      .values({
        stallId: input.stallId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment ?? null,
        likeCount: 0,
      });
    return rows[0];
  }

  async remove(id: number) {
    const db = await getDb();
    const rows = await db.delete(reviews).where(eq(reviews.id, id)).output();
    return rows[0];
  }

  // Hitung ulang avg_rating & review_count warung dari data REVIEWS.
  async recalcStallStats(stallId: number) {
    const db = await getDb();
    const rows = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.stallId, stallId));

    const count = rows.length;
    const avg = count > 0 ? rows.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await db
      .update(stalls)
      .set({ avgRating: avg.toFixed(2), reviewCount: count })
      .where(eq(stalls.id, stallId));
  }
}