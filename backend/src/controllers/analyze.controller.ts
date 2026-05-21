import { Request, Response } from 'express';
import { AnalyzeRequestBody, AnalyzeResponseBody } from '../contracts.js';
import { AnalyzerService } from '../services/analyzer.service.js';

export class AnalyzeController {
  constructor(private readonly analyzerService: AnalyzerService) {}


  handle(req: Request, res: Response): void {
    try {
      const { sourceCode } = req.body as AnalyzeRequestBody;

      if (typeof sourceCode !== 'string') {       
        res.status(400).json({ error: 'Campo "sourceCode" deve ser uma string.' });
        return;
      }

      const result = this.analyzerService.analyze(sourceCode); 

      const response: AnalyzeResponseBody = {
        status: result.syntaxError ? 'error' : 'success',
        tokens: result.tokens,
        syntaxError: result.syntaxError,
      };

      res.status(200).json(response); 
    } catch (err) {
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}