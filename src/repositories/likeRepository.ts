import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { likes, reviews } from '../db/schema.ts';

export interface CreateLikeInput {
  reviewId: number;
  userId: number;
}

export class LikeRepository {
  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(likes).where(eq(likes.id, id));
    return rows[0];
  }

  async findByReviewAndUser(reviewId: number, userId: number) {
    const db = await getDb();
    const rows = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.reviewId, reviewId), eq(likes.userId, userId)));
    return rows[0];
  }

  async create(input: CreateLikeInput) {
    const db = await getDb();
    const rows = await db
      .insert(likes)
      .output()
      .values({ reviewId: input.reviewId, userId: input.userId });
    return rows[0];
  }

  async remove(id: number) {
    const db = await getDb();
    const rows = await db.delete(likes).where(eq(likes.id, id)).output();
    return rows[0];
  }

  // Hitung ulang like_count sebuah review dari tabel LIKES.
  async recalcReviewLikeCount(reviewId: number) {
    const db = await getDb();
    const rows = await db.select({ id: likes.id }).from(likes).where(eq(likes.reviewId, reviewId));
    const likeCount = rows.length;
    await db.update(reviews).set({ likeCount }).where(eq(reviews.id, reviewId));
    return likeCount;
  }
}