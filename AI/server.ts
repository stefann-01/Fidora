import cors from 'cors';
import express from 'express';
import { EvidenceAnalyzer } from './relevance';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const analyzer = new EvidenceAnalyzer();

app.post('/api/analyze', async (req, res) => {
  try {
    const { evidence, statement, claimed_side } = req.body;
    
    if (!evidence || !statement || typeof claimed_side !== 'boolean') {
      return res.status(400).json({ 
        error: 'Missing required fields: evidence, statement, claimed_side' 
      });
    }

    const result = await analyzer.analyze(evidence, statement, claimed_side);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/batch-analyze', async (req, res) => {
  try {
    const { evidence_list } = req.body;
    
    if (!Array.isArray(evidence_list)) {
      return res.status(400).json({ error: 'evidence_list must be an array' });
    }

    const results = await analyzer.batchAnalyze(evidence_list);
    res.json(results);
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`AI Evidence Analyzer API running on port ${port}`);
}); 