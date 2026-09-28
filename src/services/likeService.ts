import { LikeRepository, type CreateLikeInput } from '../repositories/likeRepository.ts';
import { ReviewRepository } from '../repositories/reviewRepository.ts';
import { UserRepository } from '../repositories/userRepository.ts';

export class LikeService {
  private likeRepository: LikeRepository;
  private reviewRepository: ReviewRepository;
  private userRepository: UserRepository;

  constructor(
    likeRepository: LikeRepository = new LikeRepository(),
    reviewRepository: ReviewRepository = new ReviewRepository(),
    userRepository: UserRepository = new UserRepository(),
  ) {
    this.likeRepository = likeRepository;
    this.reviewRepository = reviewRepository;
    this.userRepository = userRepository;
  }

  async createLike(input: CreateLikeInput) {
    const review = await this.reviewRepository.findByIdWithUser(input.reviewId);
    if (!review) throw new Error('REVIEW_NOT_FOUND');

    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    if (review.userId === input.userId) throw new Error('SELF_LIKE');

    const existing = await this.likeRepository.findByReviewAndUser(input.reviewId, input.userId);
    if (existing) throw new Error('LIKE_EXISTS');

    const row = await this.likeRepository.create(input);
    if (!row) throw new Error('LIKE_NOT_FOUND');

    const likeCount = await this.likeRepository.recalcReviewLikeCount(input.reviewId);
    return { ...row, reviewLikeCount: likeCount };
  }

  async deleteLike(id: number) {
    const existing = await this.likeRepository.findById(id);
    if (!existing) throw new Error('LIKE_NOT_FOUND');

    await this.likeRepository.remove(id);
    const likeCount = await this.likeRepository.recalcReviewLikeCount(existing.reviewId);
    return { ...existing, reviewLikeCount: likeCount };
  }
}