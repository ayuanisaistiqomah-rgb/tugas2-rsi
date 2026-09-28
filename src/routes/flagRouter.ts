import { Router } from 'express';
import { FlagController } from '../controllers/flagController.ts';

const flagRouter = Router();
const flagController = new FlagController();

flagRouter.get('/', (req, res) => {
  // #swagger.tags = ['Flags']
  // #swagger.summary = 'Daftar laporan review (+ nama pelapor & komentar review)'
  // #swagger.parameters['status'] = { in: 'query', type: 'string', enum: ['pending', 'resolved', 'dismissed'], description: 'Filter berdasarkan status' }
  // #swagger.responses[200] = { description: 'Daftar laporan' }
  // #swagger.responses[400] = { description: 'Query tidak valid' }
  return flagController.getFlags(req, res);
});

flagRouter.put('/:id', (req, res) => {
  // #swagger.tags = ['Flags']
  // #swagger.summary = 'Update status laporan'
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/FlagStatusUpdate' } }
  // #swagger.responses[200] = { description: 'Status laporan ter-update' }
  // #swagger.responses[400] = { description: 'Status tidak valid' }
  // #swagger.responses[404] = { description: 'Laporan tidak ditemukan' }
  return flagController.updateFlagStatus(req, res);
});

export { flagRouter };