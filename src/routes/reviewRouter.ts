import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.ts';

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.get('/', (req, res) => {
  // #swagger.tags = ['Reviews']
  // #swagger.summary = 'Daftar review + nama user (JOIN)'
  // #swagger.parameters['stallId'] = { in: 'query', type: 'integer', description: 'Filter berdasarkan ID warung' }
  // #swagger.responses[200] = { description: 'Daftar review beserta nama user & warung' }
  // #swagger.responses[400] = { description: 'Query tidak valid' }
  return reviewController.getReviews(req, res);
});

reviewRouter.post('/', (req, res) => {
  // #swagger.tags = ['Reviews']
  // #swagger.summary = 'Tambah review (hanya customer, 1x per warung)'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ReviewInput' } }
  // #swagger.responses[201] = { description: 'Review dibuat' }
  // #swagger.responses[400] = { description: 'Body tidak valid' }
  // #swagger.responses[403] = { description: 'User bukan customer' }
  // #swagger.responses[404] = { description: 'Warung atau user tidak ditemukan' }
  // #swagger.responses[409] = { description: 'User sudah pernah mengulas warung ini' }
  return reviewController.createReview(req, res);
});

reviewRouter.delete('/:id', (req, res) => {
  // #swagger.tags = ['Reviews']
  // #swagger.summary = 'Hapus review'
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.responses[200] = { description: 'Review terhapus' }
  // #swagger.responses[404] = { description: 'Review tidak ditemukan' }
  return reviewController.deleteReview(req, res);
});

export { reviewRouter };