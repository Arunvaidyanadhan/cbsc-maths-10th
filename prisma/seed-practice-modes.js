const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const practiceModes = [
  {
    id: 'pm1',
    slug: 'previous-year',
    name: 'Previous Year Questions',
    description: 'Real exam questions from CBSE board papers (2018-2024)',
    icon: '??',
    tag: 'pyq',
    color: '#0D7A6A',
    isPro: false,
    isActive: true,
    order: 1,
  },
  {
    id: 'pm2',
    slug: 'most-asked',
    name: 'Most Asked Questions',
    description: 'Highest frequency topics that appear every year',
    icon: '??',
    tag: 'popular',
    color: '#E07B00',
    isPro: false,
    isActive: true,
    order: 2,
  },
  {
    id: 'pm3',
    slug: 'quarterly-exam',
    name: 'Quarterly Exam Focus',
    description: 'Chapters and question types for Q1 unit test prep',
    icon: '??',
    tag: 'quarterly',
    color: '#6366F1',
    isPro: false,
    isActive: true,
    order: 3,
  },
  {
    id: 'pm4',
    slug: 'half-yearly',
    name: 'Half Yearly Focus',
    description: 'Covers first 8 chapters - mid-year exam ready',
    icon: '??',
    tag: 'half-yearly',
    color: '#0891B2',
    isPro: true,
    isActive: true,
    order: 4,
  },
  {
    id: 'pm5',
    slug: 'theorem-heavy',
    name: 'Theorem Heavy',
    description: 'Proof-based and theorem application questions',
    icon: '??',
    tag: 'theorems',
    color: '#7C3AED',
    isPro: true,
    isActive: true,
    order: 5,
  },
  {
    id: 'pm6',
    slug: 'formula-validation',
    name: 'Formula Validation',
    description: 'Test your formula recall and application speed',
    icon: '??',
    tag: 'formulas',
    color: '#059669',
    isPro: true,
    isActive: true,
    order: 6,
  },
  {
    id: 'pm7',
    slug: 'scenario-based',
    name: 'Scenario Based',
    description: 'Word problems and real-world application questions',
    icon: '??',
    tag: 'scenario',
    color: '#DC2626',
    isPro: true,
    isActive: true,
    order: 7,
  },
];

async function seedPracticeModes() {
  console.log('Seeding practice modes...');
  
  for (const mode of practiceModes) {
    await prisma.practiceMode.upsert({
      where: { slug: mode.slug },
      update: mode,
      create: mode,
    });
  }
  
  console.log('Practice modes seeded successfully!');
}

seedPracticeModes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
