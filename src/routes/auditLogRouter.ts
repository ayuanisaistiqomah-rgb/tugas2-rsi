import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController.ts';

const auditLogRouter = Router();
const auditLogController = new AuditLogController();

auditLogRouter.get('/', (req, res) => {
  // #swagger.tags = ['Audit Logs']
  // #swagger.summary = 'Daftar jejak aktivitas (+ nama user), terbaru di atas'
  // #swagger.parameters['userId'] = { in: 'query', type: 'integer', description: 'Filter berdasarkan user' }
  // #swagger.parameters['action'] = { in: 'query', type: 'string', description: 'Filter aksi, mis. CREATE / UPDATE' }
  // #swagger.parameters['targetTable'] = { in: 'query', type: 'string', description: 'Filter tabel target, mis. REVIEWS' }
  // #swagger.responses[200] = { description: 'Daftar audit log' }
  // #swagger.responses[400] = { description: 'Query tidak valid' }
  return auditLogController.getAuditLogs(req, res);
});

auditLogRouter.post('/', (req, res) => {
  // #swagger.tags = ['Audit Logs']
  // #swagger.summary = 'Catat aktivitas baru'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/AuditLogInput' } }
  // #swagger.responses[201] = { description: 'Audit log dibuat' }
  // #swagger.responses[400] = { description: 'Body tidak valid' }
  // #swagger.responses[404] = { description: 'User tidak ditemukan' }
  return auditLogController.createAuditLog(req, res);
});

export { auditLogRouter };