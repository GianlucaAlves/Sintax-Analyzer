import { Lexer } from './core/Lexer.js';
import { Parser } from './core/Parser.js';
import { AnalyzerService } from './services/analyzer.service.js';
import { AnalyzeController } from './controllers/analyze.controller.js';

const lexer    = new Lexer();
const parser   = new Parser();
const service  = new AnalyzerService(lexer, parser);

export const analyzeController = new AnalyzeController(service);