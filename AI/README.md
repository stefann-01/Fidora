# Evidence Analyzer (TypeScript)

A TypeScript implementation of an AI-powered evidence analyzer that evaluates whether evidence supports, opposes, is unrelated to, or is not evidence for given statements. Includes quality scoring for credibility assessment.

## Features

- Evidence relationship analysis (SUPPORT, OPPOSE, UNRELATED, NOT_EVIDENCE)
- Confidence scoring (0-1)
- Quality scoring for credible evidence assessment (0-1)
- Web link content analysis
- Batch processing capabilities
- TypeScript support with full type safety

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Build the project:
```bash
npm run build
```

## Usage

### Basic Usage

```typescript
import { EvidenceAnalyzer } from './relevance';

const analyzer = new EvidenceAnalyzer();

const result = await analyzer.analyze(
  "According to a peer-reviewed study...", // evidence
  "Climate change is real", // statement
  true // claimed_side (true = supports, false = opposes)
);

console.log(result);
// {
//   predicted_relationship: "SUPPORT",
//   confidence: 0.9,
//   quality_score: 0.85,
//   reasoning: "...",
//   evidence: "...",
//   statement: "...",
//   claimed_side: true
// }
```

### Batch Analysis

```typescript
const evidenceList = [
  { evidence: "Evidence 1", statement: "Statement", claimed_side: true },
  { evidence: "Evidence 2", statement: "Statement", claimed_side: false }
];

const results = await analyzer.batchAnalyze(evidenceList);
```

### Quick Function

```typescript
import { analyzeEvidence } from './relevance';

const result = await analyzeEvidence(
  "Some evidence text",
  "Some statement", 
  true
);
```

## Quality Score Ranges

- **0.8-1.0**: High quality (expert sources, peer-reviewed studies)
- **0.6-0.8**: Good quality (reputable news sources, documented reports)
- **0.4-0.6**: Moderate quality (general sources, reasonable arguments)
- **0.2-0.4**: Low quality (weak sources, limited information)
- **0.0-0.2**: Very low quality (unreliable sources, no supporting data)

## Development

Run in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

## Types

The analyzer returns `AnalysisResult` objects with the following structure:

```typescript
interface AnalysisResult {
  reasoning: string;
  predicted_relationship: 'SUPPORT' | 'OPPOSE' | 'UNRELATED' | 'NOT_EVIDENCE';
  confidence: number; // 0-1
  quality_score: number | null; // 0-1 for SUPPORT/OPPOSE, null for others
  evidence: string;
  statement: string;
  claimed_side: boolean;
}
``` 