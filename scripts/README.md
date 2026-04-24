# Database Seeding - Single Source of Truth

## Overview

The `seed-master.js` script is the **single source of truth** for all database content. It populates:
- Practice Modes
- Badges  
- Chapters & Topics
- Questions (from JSON files)

## Quick Start

```bash
# Clear database and seed all content
npm run db:seed

# Or run directly
node scripts/seed-master.js
```

## Adding New Content

### 1. Add Questions for Existing Chapter

Edit the JSON file in `Data Source/` folder:
- `Real numbers.json`
- `polynomials.json`

JSON format:
```json
[
  {
    "text": "Question text here?",
    "option1": "First option",
    "option2": "Second option",
    "option3": "Third option",
    "option4": "Fourth option",
    "correctIndex": 1,
    "explanation": "Why this is correct",
    "difficulty": "PASS",
    "subtopicTag": "euclid-lemma"
  }
]
```

### 2. Add a New Chapter

1. Create JSON file: `Data Source/Your Chapter.json`

2. Add chapter config in `seed-master.js`:
```javascript
const CHAPTER_CONFIG = {
  'your-chapter': {
    slug: 'your-chapter',
    name: 'Your Chapter',
    icon: '📚',
    order: 3,
    recommended: false,
    topics: [
      { slug: 'topic-1', name: 'Topic One', level: 'pass', order: 1 },
      { slug: 'topic-2', name: 'Topic Two', level: 'average', order: 2 },
      { slug: 'topic-3', name: 'Topic Three', level: 'expert', order: 3 },
    ]
  }
};
```

3. Run: `npm run db:seed`

### 3. Modify Practice Modes or Badges

Edit the `PRACTICE_MODES` or `BADGES` arrays in `seed-master.js`.

## Data Files

| File | Chapter | Topics |
|------|---------|--------|
| `Real numbers.json` | Real Numbers | Euclid's Lemma, Fundamental Theorem, Irrational Numbers |
| `polynomials.json` | Polynomials | Degree, Zeros, Graph Relations |

## Difficulty Levels

| Level | Marks Range | Description |
|-------|-------------|-------------|
| `PASS` | 35-50 | Basic concepts |
| `AVERAGE` | 50-75 | Standard problems |
| `EXPERT` | 75-90+ | Complex/challenging |

## Troubleshooting

**Questions not appearing?**
- Check `subtopicTag` in JSON matches topic slugs in CHAPTER_CONFIG
- Run with logging: `DEBUG=1 node scripts/seed-master.js`

**Duplicate data?**
- Script auto-clears data before seeding
- Uses `upsert` for reference tables (practice modes, badges)

**JSON parse errors?**
- Ensure valid JSON syntax
- Check for trailing commas
- File encoding should be UTF-8
