/**
 * MASTER SEED SCRIPT - Single Source of Truth
 * 
 * This script seeds all database content from JSON files in Data Source/ folder.
 * To add new content:
 * 1. Create a new JSON file in Data Source/ folder (e.g., "Linear Equations.json")
 * 2. Follow the same format as existing files
 * 3. Run: node scripts/seed-master.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configuration for chapters and their topics
const CHAPTER_CONFIG = {
  'real-numbers': {
    slug: 'real-numbers',
    name: 'Real Numbers',
    icon: '∞',
    order: 1,
    recommended: true,
    topics: [
      { slug: 'euclids-division-lemma', name: "Euclid's Division Lemma", level: 'pass', order: 1 },
      { slug: 'fundamental-theorem', name: 'Fundamental Theorem', level: 'average', order: 2 },
      { slug: 'irrational-numbers', name: 'Irrational Numbers', level: 'expert', order: 3 },
    ]
  },
  'polynomials': {
    slug: 'polynomials',
    name: 'Polynomials',
    icon: 'P(x)',
    order: 2,
    recommended: false,
    topics: [
      { slug: 'degree-of-polynomial', name: 'Degree of Polynomial', level: 'pass', order: 1 },
      { slug: 'zeros-of-polynomial', name: 'Zeros of Polynomial', level: 'average', order: 2 },
      { slug: 'graph-relation', name: 'Graph Relation', level: 'expert', order: 3 },
    ]
  }
};

// Practice modes configuration
const PRACTICE_MODES = [
  {
    slug: 'previous-year',
    name: 'Previous Year Questions',
    description: 'Real exam questions from CBSE board papers (2018-2024)',
    icon: '📜',
    tag: 'pyq',
    color: '#0D7A6A',
    isPro: false,
    isActive: true,
    order: 1,
  },
  {
    slug: 'most-asked',
    name: 'Most Asked Questions',
    description: 'Highest frequency topics that appear every year',
    icon: '🔥',
    tag: 'popular',
    color: '#E07B00',
    isPro: false,
    isActive: true,
    order: 2,
  },
  {
    slug: 'quarterly-exam',
    name: 'Quarterly Exam Focus',
    description: 'Chapters and question types for Q1 unit test prep',
    icon: '📅',
    tag: 'quarterly',
    color: '#6366F1',
    isPro: false,
    isActive: true,
    order: 3,
  },
  {
    slug: 'half-yearly',
    name: 'Half Yearly Focus',
    description: 'Covers first 8 chapters - mid-year exam ready',
    icon: '🎯',
    tag: 'half-yearly',
    color: '#0891B2',
    isPro: true,
    isActive: true,
    order: 4,
  },
  {
    slug: 'theorem-heavy',
    name: 'Theorem Heavy',
    description: 'Proof-based and theorem application questions',
    icon: '📐',
    tag: 'theorems',
    color: '#7C3ED',
    isPro: true,
    isActive: true,
    order: 5,
  },
  {
    slug: 'formula-validation',
    name: 'Formula Validation',
    description: 'Test your formula recall and application speed',
    icon: '🧮',
    tag: 'formulas',
    color: '#059669',
    isPro: true,
    isActive: true,
    order: 6,
  },
  {
    slug: 'scenario-based',
    name: 'Scenario Based',
    description: 'Word problems and real-world application questions',
    icon: '🌍',
    tag: 'scenario',
    color: '#DC2626',
    isPro: true,
    isActive: true,
    order: 7,
  },
];

// Badge definitions
const BADGES = [
  {
    name: 'First Steps',
    description: 'Complete your first practice session',
    icon: '🌟',
    type: 'session',
    criteria: { sessionsCompleted: 1 },
    order: 1,
    isActive: true,
  },
  {
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    type: 'streak',
    criteria: { streakDays: 3 },
    order: 2,
    isActive: true,
  },
  {
    name: 'Unstoppable',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    type: 'streak',
    criteria: { streakDays: 7 },
    order: 3,
    isActive: true,
  },
  {
    name: 'Math Champion',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    type: 'streak',
    criteria: { streakDays: 30 },
    order: 4,
    isActive: true,
  },
  {
    name: 'Topic Master',
    description: 'Achieve 100% mastery in any topic',
    icon: '🏆',
    type: 'xp',
    criteria: { masteryPercent: 100 },
    order: 5,
    isActive: true,
  },
  {
    name: 'Perfectionist',
    description: 'Score 100% in a practice session',
    icon: '💯',
    type: 'accuracy',
    criteria: { accuracyPercent: 100 },
    order: 6,
    isActive: true,
  },
];

// Level display config
const LEVEL_CONFIG = {
  pass: { emoji: '🟢', label: 'Pass Level', range: '35–50 marks', locked: false },
  average: { emoji: '🔵', label: 'Average Level', range: '50–75 marks', locked: false },
  expert: { emoji: '🔴', label: 'Expert Level', range: '75–90+ marks', locked: true },
};

/**
 * Load questions from JSON files in Data Source folder
 * Handles files with multiple concatenated JSON arrays
 */
function loadQuestionsFromFile(filename) {
  const filePath = path.join(__dirname, '..', 'Data Source', filename);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filename}`);
    return [];
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Handle potential BOM and fix common JSON issues
    const cleanContent = content.replace(/^\uFEFF/, '').trim();
    
    // Try to parse as single array first
    let allQuestions = [];
    
    try {
      const parsed = JSON.parse(cleanContent);
      if (Array.isArray(parsed)) {
        allQuestions = parsed;
      }
    } catch (e) {
      // File has multiple arrays - extract and merge all of them
      const arrayMatches = cleanContent.match(/\[[\s\S]*?\]/g);
      if (arrayMatches) {
        for (const match of arrayMatches) {
          try {
            const arr = JSON.parse(match);
            if (Array.isArray(arr) && arr.length > 0) {
              allQuestions = allQuestions.concat(arr);
            }
          } catch {}
        }
      }
    }
    
    if (allQuestions.length === 0) {
      console.warn(`No valid questions found in ${filename}`);
      return [];
    }
    
    return allQuestions.map((q, index) => ({
      text: q.text || q.question,
      option1: q.option1 || q.options?.[0] || '',
      option2: q.option2 || q.options?.[1] || '',
      option3: q.option3 || q.options?.[2] || '',
      option4: q.option4 || q.options?.[3] || '',
      correctIndex: (q.correctIndex || q.correct || 1) - 1, // Convert to 0-based
      explanation: q.explanation || '',
      subtopicTag: q.subtopicTag || q.subtopic || 'general',
      difficulty: q.difficulty || 'PASS',
      sourceFile: filename,
      index,
    }));
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error.message);
    return [];
  }
}

/**
 * Discover all JSON files in Data Source folder
 */
function discoverDataFiles() {
  const dataSourcePath = path.join(__dirname, '..', 'Data Source');
  
  if (!fs.existsSync(dataSourcePath)) {
    console.warn('Data Source folder not found');
    return [];
  }
  
  return fs.readdirSync(dataSourcePath)
    .filter(f => f.endsWith('.json') && !f.startsWith('prompt'))
    .sort();
}

/**
 * Map filename to chapter slug
 */
function filenameToChapterSlug(filename) {
  const base = filename.replace('.json', '').toLowerCase();
  
  // Map common variations to slugs
  const mappings = {
    'real numbers': 'real-numbers',
    'real-numbers': 'real-numbers',
    'polynomials': 'polynomials',
    'linear equations': 'linear-equations',
    'quadratic equations': 'quadratic-equations',
    'triangles': 'triangles',
    'coordinate geometry': 'coordinate-geometry',
    'statistics': 'statistics',
    'probability': 'probability',
  };
  
  return mappings[base] || base.replace(/\s+/g, '-');
}

/**
 * Clear all existing data
 */
async function clearData() {
  console.log('Clearing existing data...');
  
  // Delete in order of dependencies (child tables first)
  const tables = [
    'answer', 'practiceModeAnswer',
    'attempt', 'practiceModeAttempt',
    'mistake', 'topicProgress', 'dailyStats', 'chapterProgress', 'userBadge', 'subtopicFeedback',
    'question', 'questionMode',
    'topic', 'chapter',
    'user',
  ];
  
  for (const table of tables) {
    try {
      await prisma[table].deleteMany({});
      console.log(`  Cleared: ${table}`);
    } catch (e) {
      // Table might not exist or have different name
    }
  }
  
  // Reset PricingStats
  try {
    await prisma.pricingStats.updateMany({
      where: { id: 1 },
      data: { totalPaidUsers: 0 }
    });
  } catch {}
  
  console.log('Data cleared successfully');
}

/**
 * Seed practice modes
 */
async function seedPracticeModes() {
  console.log('Seeding practice modes...');
  
  for (const mode of PRACTICE_MODES) {
    await prisma.practiceMode.upsert({
      where: { slug: mode.slug },
      update: mode,
      create: mode,
    });
  }
  
  console.log(`  Created ${PRACTICE_MODES.length} practice modes`);
}

/**
 * Seed badges
 */
async function seedBadges() {
  console.log('Seeding badges...');
  
  let created = 0;
  let updated = 0;
  
  for (const badge of BADGES) {
    // Check if badge exists by name
    const existing = await prisma.badge.findFirst({
      where: { name: badge.name }
    });
    
    if (existing) {
      // Update existing
      await prisma.badge.update({
        where: { id: existing.id },
        data: badge,
      });
      updated++;
    } else {
      // Create new
      await prisma.badge.create({
        data: badge,
      });
      created++;
    }
  }
  
  console.log(`  Created ${created} badges, updated ${updated} badges`);
}

/**
 * Seed chapters and topics
 */
async function seedChaptersAndTopics() {
  console.log('Seeding chapters and topics...');
  
  const dataFiles = discoverDataFiles();
  console.log(`  Found data files: ${dataFiles.join(', ')}`);
  
  let totalChapters = 0;
  let totalTopics = 0;
  
  for (const filename of dataFiles) {
    const chapterSlug = filenameToChapterSlug(filename);
    const config = CHAPTER_CONFIG[chapterSlug];
    
    if (!config) {
      console.warn(`  No config found for chapter: ${chapterSlug}, skipping`);
      continue;
    }
    
    // Create chapter
    const chapter = await prisma.chapter.upsert({
      where: { slug: config.slug },
      update: {
        name: config.name,
        icon: config.icon,
        order: config.order,
        recommended: config.recommended,
        isActive: true,
      },
      create: {
        slug: config.slug,
        name: config.name,
        icon: config.icon,
        order: config.order,
        recommended: config.recommended,
        totalTopics: config.topics.length,
        isActive: true,
      },
    });
    
    totalChapters++;
    console.log(`  Created chapter: ${chapter.name}`);
    
    // Create topics for this chapter
    for (const topicConfig of config.topics) {
      const levelInfo = LEVEL_CONFIG[topicConfig.level];
      
      await prisma.topic.upsert({
        where: { 
          slug: topicConfig.slug 
        },
        update: {
          chapterId: chapter.id,
          name: topicConfig.name,
          order: topicConfig.order,
          level: topicConfig.level,
          emoji: levelInfo.emoji,
          label: levelInfo.label,
          range: levelInfo.range,
          locked: levelInfo.locked,
          isActive: true,
        },
        create: {
          chapterId: chapter.id,
          slug: topicConfig.slug,
          name: topicConfig.name,
          order: topicConfig.order,
          questionCount: 0, // Will be updated after questions are added
          level: topicConfig.level,
          emoji: levelInfo.emoji,
          label: levelInfo.label,
          range: levelInfo.range,
          locked: levelInfo.locked,
          isActive: true,
        },
      });
      
      totalTopics++;
    }
  }
  
  console.log(`  Total: ${totalChapters} chapters, ${totalTopics} topics`);
  return { totalChapters, totalTopics };
}

/**
 * Seed questions from JSON files
 */
async function seedQuestions() {
  console.log('Seeding questions...');
  
  const dataFiles = discoverDataFiles();
  let totalQuestions = 0;
  let totalSkipped = 0;
  
  // Get all topics
  const topics = await prisma.topic.findMany({
    include: { chapter: true }
  });
  
  const topicsBySlug = {};
  topics.forEach(t => {
    topicsBySlug[t.slug] = t;
  });
  
  for (const filename of dataFiles) {
    console.log(`  Processing: ${filename}`);
    
    const questions = loadQuestionsFromFile(filename);
    if (questions.length === 0) {
      console.log(`    No questions found, skipping`);
      continue;
    }
    
    console.log(`    Found ${questions.length} questions`);
    
    // Group questions by subtopic to determine topic assignment
    const questionsBySubtopic = {};
    questions.forEach(q => {
      const tag = q.subtopicTag.toLowerCase().replace(/_/g, '-');
      if (!questionsBySubtopic[tag]) {
        questionsBySubtopic[tag] = [];
      }
      questionsBySubtopic[tag].push(q);
    });
    
    // Create questions for each topic
    for (const [subtopicTag, subtopicQuestions] of Object.entries(questionsBySubtopic)) {
      // Find matching topic based on subtopic tag
      let matchingTopic = null;
      
      // Try to match subtopic to topic slug
      for (const topic of topics) {
        const topicSlug = topic.slug.toLowerCase();
        const tagLower = subtopicTag.toLowerCase();
        
        if (tagLower.includes(topicSlug) || topicSlug.includes(tagLower.replace(/-/g, ''))) {
          matchingTopic = topic;
          break;
        }
        
        // Check for specific mappings
        if (tagLower.includes('euclid') && topicSlug.includes('euclid')) {
          matchingTopic = topic;
          break;
        }
        if (tagLower.includes('prime') && topicSlug.includes('fundamental')) {
          matchingTopic = topic;
          break;
        }
        if (tagLower.includes('irrational') && topicSlug.includes('irrational')) {
          matchingTopic = topic;
          break;
        }
        if ((tagLower.includes('zero') || tagLower.includes('poly')) && topicSlug.includes('zero')) {
          matchingTopic = topic;
          break;
        }
        if ((tagLower.includes('degree') || tagLower.includes('poly')) && topicSlug.includes('degree')) {
          matchingTopic = topic;
          break;
        }
        if (tagLower.includes('graph') && topicSlug.includes('graph')) {
          matchingTopic = topic;
          break;
        }
      }
      
      if (!matchingTopic) {
        console.log(`    No matching topic for subtopic: ${subtopicTag}, skipping ${subtopicQuestions.length} questions`);
        totalSkipped += subtopicQuestions.length;
        continue;
      }
      
      console.log(`    Assigning ${subtopicQuestions.length} questions to topic: ${matchingTopic.name}`);
      
      // Create questions for this topic
      for (const q of subtopicQuestions) {
        try {
          await prisma.question.create({
            data: {
              topicId: matchingTopic.id,
              chapterId: matchingTopic.chapterId,
              level: matchingTopic.level,
              text: q.text,
              option1: q.option1,
              option2: q.option2,
              option3: q.option3,
              option4: q.option4,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              subtopicTag: q.subtopicTag,
              difficulty: mapDifficulty(q.difficulty),
              isActive: true,
            },
          });
          totalQuestions++;
        } catch (error) {
          console.error(`      Error creating question: ${error.message}`);
        }
      }
    }
  }
  
  // Update question counts for topics
  for (const topic of topics) {
    const count = await prisma.question.count({
      where: { topicId: topic.id }
    });
    await prisma.topic.update({
      where: { id: topic.id },
      data: { questionCount: count }
    });
  }
  
  console.log(`  Total questions created: ${totalQuestions}`);
  if (totalSkipped > 0) {
    console.log(`  Skipped (no matching topic): ${totalSkipped}`);
  }
}

/**
 * Map difficulty string to number
 */
function mapDifficulty(difficulty) {
  if (!difficulty) return 1;
  const d = difficulty.toString().toUpperCase();
  if (d === 'PASS' || d === '1') return 1;
  if (d === 'AVERAGE' || d === '2') return 2;
  if (d === 'EXPERT' || d === '3') return 3;
  return 1;
}

/**
 * Main seed function
 */
async function seedMaster() {
  console.log('='.repeat(60));
  console.log('MASTER SEED - Single Source of Truth');
  console.log('='.repeat(60));
  console.log();
  
  try {
    // Step 1: Clear existing data
    await clearData();
    console.log();
    
    // Step 2: Seed practice modes
    await seedPracticeModes();
    console.log();
    
    // Step 3: Seed badges
    await seedBadges();
    console.log();
    
    // Step 4: Seed chapters and topics
    await seedChaptersAndTopics();
    console.log();
    
    // Step 5: Seed questions from JSON
    await seedQuestions();
    console.log();
    
    console.log('='.repeat(60));
    console.log('Seed completed successfully!');
    console.log('='.repeat(60));
    console.log();
    console.log('Summary:');
    console.log('  - Practice modes: ' + PRACTICE_MODES.length);
    console.log('  - Badges: ' + BADGES.length);
    console.log('  - Data files processed: ' + discoverDataFiles().length);
    console.log();
    console.log('To add new content:');
    console.log('  1. Create JSON file in "Data Source/" folder');
    console.log('  2. Add chapter config in CHAPTER_CONFIG');
    console.log('  3. Run: node scripts/seed-master.js');
    console.log();
    
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedMaster();
