# Job Card Material Matching

This documentation explains how the job card material matching system works.

## Overview

Job cards now support primary matching by `material` field, with fallback to text analysis of the `materials` description field.

## Type Definition

```typescript
export type MaterialType = 'straw' | 'hay' | 'grain' | 'fertilizer' | 'soil' | 'other';

export interface JobCard {
  // ... other fields
  materials: string;  // Text description of materials
  material?: MaterialType;  // Optional explicit material type
  // ... other fields
}
```

## Primary Matching Rule

**The `material` field takes precedence over text analysis:**

1. If `job.material` is set, that value is used
2. Only if `job.material` is undefined, the system analyzes `job.materials` text

### Example:

```typescript
const job1: JobCard = {
  materials: "Wheat grain for processing",
  material: "straw",  // ← This takes priority
  // ...
};

// Result: getJobCardMaterialType(job1) returns "straw"
// Even though the text says "grain", the explicit material field wins
```

```typescript
const job2: JobCard = {
  materials: "Delivering straw bales to farm",
  // material is undefined
  // ...
};

// Result: getJobCardMaterialType(job2) returns "straw"
// Analyzed from the materials text
```

## Usage

### Get Material Type

```typescript
import { getJobCardMaterialType } from '@/utils/jobCardMatching';

const material = getJobCardMaterialType(jobCard);
// Returns: 'straw' | 'hay' | 'grain' | 'fertilizer' | 'soil' | 'other'
```

### Match by Material

```typescript
import { matchJobCardByMaterial } from '@/utils/jobCardMatching';

const isStrawJob = matchJobCardByMaterial(jobCard, 'straw');
// Returns true if the job's material type is 'straw'
```

### Categorize Multiple Jobs

```typescript
import { categorizeJobCardsByMaterial } from '@/utils/jobCardMatching';

const categorized = categorizeJobCardsByMaterial(jobCards);
/* Returns:
{
  straw: [JobCard, JobCard, ...],
  hay: [JobCard, ...],
  grain: [JobCard, ...],
  // ...
}
*/
```

### Display Helpers

```typescript
import { getMaterialLabel, getMaterialColor } from '@/utils/jobCardMatching';

const label = getMaterialLabel('straw');  // Returns "Straw"
const color = getMaterialColor('straw');  // Returns "#f59e0b"
```

## Creating Job Cards

When creating a new job card, users can optionally select a material type. This explicit selection will be used for matching:

```typescript
const newJobCard: JobCard = {
  // ...
  materials: "Bales of hay",
  material: "hay",  // User selected this explicitly
  // ...
};
```

If the user doesn't select a material type, the system will analyze the text description when needed.

## Text Analysis Rules

When `material` is undefined, the system checks the `materials` text (case-insensitive):

- **straw**: Contains "straw"
- **hay**: Contains "hay"  
- **grain**: Contains "grain", "wheat", or "barley"
- **fertilizer**: Contains "fertilizer" or "fertiliser"
- **soil**: Contains "soil", "dirt", or "compost"
- **other**: Default fallback

## Best Practices

1. **Always use the getter function**: Use `getJobCardMaterialType()` instead of accessing fields directly
2. **Set material explicitly when known**: This ensures accurate categorization
3. **Use the utility functions**: They handle all fallback logic automatically
4. **Consistent categorization**: The same job card will always return the same material type

## Integration Points

The material matching system can be used in:

- **Reports**: Filter job cards by material type
- **Invoicing**: Group jobs by material for billing
- **Analytics**: Track volumes per material type
- **Search**: Find jobs by material category
