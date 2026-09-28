import { Router } from 'express';
import { LikeController } from '../controllers/likeController.ts';

const likeRouter = Router();
const likeController = new LikeController();

likeRouter.post('/', (req, res) => {
  // #swagger.tags = ['Likes']
  // #swagger.summary = 'Like sebuah review'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/LikeInput' } }
  // #swagger.responses[201] = { description: 'Like ditambahkan, like_count review ter-update' }
  // #swagger.responses[400] = { description: 'Body tidak valid / like review sendiri' }
  // #swagger.responses[404] = { description: 'Review atau user tidak ditemukan' }
  // #swagger.responses[409] = { description: 'Sudah pernah like' }
  return likeController.createLike(req, res);
});

likeRouter.delete('/:id', (req, res) => {
  // #swagger.tags = ['Likes']
  // #swagger.summary = 'Batalkan like (unlike)'
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.responses[200] = { description: 'Like dihapus, like_count review ter-update' }
  // #swagger.responses[404] = { description: 'Like tidak ditemukan' }
  return likeController.deleteLike(req, res);
});

export { likeRouter };