import { ReviewRepository, type CreateReviewInput } from '../repositories/reviewRepository.ts';
import { StallRepository } from '../repositories/stallRepository.ts';
import { UserRepository } from '../repositories/userRepository.ts';

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private stallRepository: StallRepository;
  private userRepository: UserRepository;

  constructor(
    reviewRepository: ReviewRepository = new ReviewRepository(),
    stallRepository: StallRepository = new StallRepository(),
    userRepository: UserRepository = new UserRepository(),
  ) {
    this.reviewRepository = reviewRepository;
    this.stallRepository = stallRepository;
    this.userRepository = userRepository;
  }

  async getAllReviews(stallId?: number) {
    return this.reviewRepository.findAllWithUser(stallId);
  }

  async getReviewById(id: number) {
    const row = await this.reviewRepository.findByIdWithUser(id);
    if (!row) throw new Error('REVIEW_NOT_FOUND');
    return row;
  }

  async createReview(input: CreateReviewInput) {
    const stall = await this.stallRepository.findById(input.stallId);
    if (!stall) throw new Error('STALL_NOT_FOUND');

    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.role !== 'customer') throw new Error('NOT_CUSTOMER');

    const existing = await this.reviewRepository.findByUserAndStall(input.userId, input.stallId);
    if (existing) throw new Error('REVIEW_EXISTS');

    const row = await this.reviewRepository.create(input);
    if (!row) throw new Error('REVIEW_NOT_FOUND');

    await this.reviewRepository.recalcStallStats(input.stallId);
    return this.getReviewById(row.id);
  }

  async deleteReview(id: number) {
    const existing = await this.getReviewById(id); // 404 bila tidak ada
    await this.reviewRepository.remove(id);        // LIKES & FLAGS ikut terhapus (ON DELETE CASCADE)
    await this.reviewRepository.recalcStallStats(existing.stallId);
    return existing;
  }
}