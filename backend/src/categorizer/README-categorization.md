# AI Claim Categorization Feature

## Overview

This feature automatically categorizes claims into one of 25 predefined categories using OpenAI's GPT-4 model. When a claim is posted, the AI analyzes the content and assigns the most appropriate category, which is then saved to the database.

## Features

### Automatic Categorization
- **Trigger**: Every time a new claim is posted via `addClaim()`
- **AI Model**: GPT-4-mini for fast and cost-effective categorization
- **Categories**: 25 predefined categories covering various topics
- **Fallback**: Defaults to "Other" if AI categorization fails

### Manual Recategorization
- **Single Claim**: Recategorize individual claims
- **Batch Processing**: Recategorize all existing claims at once
- **Admin Interface**: Built-in UI for testing and management

## Available Categories

The system supports 25 categories:

1. **Politics** - Political statements, government policies, elections
2. **Technology** - Software, hardware, AI, digital innovation
3. **Science** - Scientific research, discoveries, experiments
4. **Finance** - Economics, banking, investments, cryptocurrency
5. **Health** - Medical information, diseases, treatments, fitness
6. **Environment** - Climate change, pollution, conservation
7. **Sports** - Athletic events, teams, competitions
8. **Entertainment** - Movies, TV, music, celebrities, gaming
9. **Business** - Companies, corporate news, entrepreneurship
10. **Education** - Schools, universities, academic policies
11. **Social Issues** - Equality, human rights, social justice
12. **Law & Legal** - Legal cases, legislation, court decisions
13. **International Affairs** - Foreign relations, global events
14. **Military & Defense** - Armed forces, national security
15. **Transportation** - Cars, planes, logistics, infrastructure
16. **Food & Nutrition** - Diet, cooking, food safety
17. **Crime & Safety** - Criminal activities, law enforcement
18. **Weather & Climate** - Weather events, natural disasters
19. **Real Estate** - Property markets, housing, construction
20. **Energy** - Power generation, renewable energy
21. **Agriculture** - Farming, crop production, food production
22. **Religion** - Religious beliefs, spiritual matters
23. **Art & Culture** - Visual arts, literature, cultural events
24. **Personal Life** - Personal experiences, lifestyle choices
25. **Other** - Content that doesn't fit other categories

## How It Works

### 1. Automatic Categorization (New Claims)

```typescript
// When adding a new claim
const success = await addClaim(url)
// AI categorization happens automatically inside addClaim()
```

The process:
1. User submits a claim URL
2. Tweet content is fetched
3. AI analyzes the content and assigns a category
4. Claim is saved with the AI-assigned category
5. Fallback to "Other" if AI fails

### 2. Manual Recategorization

```typescript
// Recategorize a single claim
const success = await recategorizeClaim(claimId)

// Recategorize all claims
const result = await recategorizeAllClaims()
```

## API Reference

### Core Functions

#### `ClaimCategorizer`
```typescript
class ClaimCategorizer {
  async categorize(content: string): Promise<CategorizationResult>
  async batchCategorize(contents: string[]): Promise<CategorizationResult[]>
}
```

#### `categorizeClaimContent(content, apiKey?)`
Convenience function for single categorization.

#### `recategorizeClaim(claimId)`
Recategorize an existing claim by ID.

#### `recategorizeAllClaims()`
Batch recategorize all claims in the database.

### Server Actions

#### `categorizeClaim(params)`
Server action for categorizing claim content.

#### `recategorizeClaimAction(params)`
Server action for recategorizing a single claim.

#### `recategorizeAllClaimsAction()`
Server action for batch recategorization.

### Type Definitions

```typescript
interface CategorizationResult {
  category: ClaimCategory
  confidence: number // 0-1
  reasoning: string
  content: string
}

type ClaimCategory = 'Politics' | 'Technology' | ... | 'Other'
```

## Usage Examples

### Frontend Usage

```typescript
import { categorizeClaim } from '@/app/actions/categorize-claim'

// Categorize content
const result = await categorizeClaim({ 
  content: "New AI breakthrough in healthcare" 
})
console.log(result.category) // "Technology" or "Health"
```

### Admin Interface

The posts page (`/posts`) includes an admin panel with:
- **Recategorize All Claims** button for batch processing
- **Recategorize** buttons for individual claims
- Real-time status updates
- Category display with color coding

### Testing

Run the test suite:
```bash
cd frontend/AI
npx ts-node test-categorizer.ts
```

## Configuration

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### AI Model Settings

- **Model**: `gpt-4o-mini` (fast and cost-effective)
- **Temperature**: `0.1` (deterministic results)
- **Max Tokens**: `500` (sufficient for categorization)
- **Response Format**: JSON object

## Error Handling

- **API Failures**: Falls back to "Other" category
- **Invalid Responses**: Logged and defaults applied
- **Network Issues**: Graceful degradation with user feedback
- **Rate Limiting**: Built-in delays for batch operations

## Performance Considerations

- **Batch Processing**: 100ms delay between requests
- **Caching**: Results are immediately saved to database
- **Fallback**: Fast fallback to prevent blocking user actions
- **Cost**: Uses GPT-4-mini for optimal cost/performance ratio

## UI Integration

### Category Display
Categories are displayed with color-coded badges using the `getCategoryColor()` helper function.

### Status Messages
Real-time feedback during categorization operations with success/error states.

### Admin Controls
Dedicated admin section for testing and managing categorization.

## Future Enhancements

1. **Category Confidence Thresholds**: Require minimum confidence levels
2. **Custom Categories**: Allow users to add custom categories
3. **Category Analytics**: Track category distribution and trends
4. **Bulk Import**: Categorize claims from CSV/JSON files
5. **Category Suggestions**: AI-suggested new categories based on content patterns

## Troubleshooting

### Common Issues

1. **"Failed to categorize claim"**
   - Check OpenAI API key
   - Verify network connectivity
   - Check API usage limits

2. **Low confidence scores**
   - Content may be ambiguous
   - Consider manual categorization
   - Add content to "Other" category

3. **Unexpected categories**
   - AI makes reasonable interpretations
   - Use manual recategorization if needed
   - Categories may overlap (e.g., "Climate Policy" could be Politics or Environment)

### Debugging

Enable detailed logging:
```typescript
console.log('AI categorized claim as:', result.category)
console.log('Confidence:', result.confidence)
console.log('Reasoning:', result.reasoning)
``` 