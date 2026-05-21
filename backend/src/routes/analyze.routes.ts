import { Router } from 'express';
import { analyzeController } from '../container.js';

const analyzeRouter = Router();
analyzeRouter.post('/analyze', (req, res) => analyzeController.handle(req, res));

export { analyzeRouter };