import { Router } from 'express';
import { UserController } from '../controllers/userController.ts';

const userRouter = Router();
const userController = new UserController();

userRouter.get('/', (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Daftar user (tanpa password)'
  // #swagger.parameters['role'] = { in: 'query', type: 'string', enum: ['admin', 'owner', 'customer'], description: 'Filter berdasarkan role' }
  // #swagger.responses[200] = { description: 'Daftar user' }
  // #swagger.responses[400] = { description: 'Query tidak valid' }
  return userController.getUsers(req, res);
});

userRouter.post('/', (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Tambah user (password di-hash)'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/UserInput' } }
  // #swagger.responses[201] = { description: 'User dibuat' }
  // #swagger.responses[400] = { description: 'Body tidak valid' }
  // #swagger.responses[409] = { description: 'Email sudah terdaftar' }
  return userController.createUser(req, res);
});

export { userRouter };