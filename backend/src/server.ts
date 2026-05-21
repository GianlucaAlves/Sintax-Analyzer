import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze.routes.js';

const app = express();
const PORT = process.env.PORT ?? 3333;

app.use(cors({ origin: 'http://localhost:5173'}));
app.use(express.json());
app.use('/api', analyzeRouter);

app.listen(PORT, () => console.log(`Server runnig on :${PORT}`));