const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const seedData = async () => {
  try {
    console.log('Connected to PostgreSQL via Prisma');

    // Clear existing data (ignore errors if tables don't exist)
    try { await prisma.answer.deleteMany({}); } catch {}
    try { await prisma.attempt.deleteMany({}); } catch {}
    try { await prisma.question.deleteMany({}); } catch {}
    try { await prisma.topicProgress.deleteMany({}); } catch {}
    try { await prisma.mistake.deleteMany({}); } catch {}
    try { await prisma.chapterProgress.deleteMany({}); } catch {}
    try { await prisma.dailyStats.deleteMany({}); } catch {}
    try { await prisma.topic.deleteMany({}); } catch {}
    try { await prisma.chapter.deleteMany({}); } catch {}
    console.log('Cleared existing data (if any)');

    // Create chapters
    const chapters = await prisma.chapter.createMany({
      data: [
        {
          slug: 'real-numbers',
          name: 'Real Numbers',
          icon: '∞',
          order: 1,
          recommended: true,
          totalTopics: 3,
          isActive: true,
        },
        {
          slug: 'polynomials',
          name: 'Polynomials',
          icon: 'P(x)',
          order: 2,
          recommended: false,
          totalTopics: 3,
          isActive: true,
        },
      ],
    });
    console.log('Created chapters:', chapters.count);
    
    // Get created chapters for foreign keys
    const realNumbersChapter = await prisma.chapter.findUnique({ where: { slug: 'real-numbers' } });
    const polynomialsChapter = await prisma.chapter.findUnique({ where: { slug: 'polynomials' } });

    // Create topics for Real Numbers
    const realNumbersTopics = await prisma.topic.createMany({
      data: [
        {
          chapterId: realNumbersChapter.id,
          slug: 'euclids-division-lemma',
          name: "Euclid's Division Lemma",
          order: 1,
          questionCount: 10,
          level: 'pass',
          emoji: '🟢',
          label: 'Pass Level',
          range: '35–50 marks',
          locked: false,
          isActive: true,
        },
        {
          chapterId: realNumbersChapter.id,
          slug: 'fundamental-theorem',
          name: 'Fundamental Theorem',
          order: 2,
          questionCount: 10,
          level: 'average',
          emoji: '🔵',
          label: 'Average Level',
          range: '50–75 marks',
          locked: false,
          isActive: true,
        },
        {
          chapterId: realNumbersChapter.id,
          slug: 'irrational-numbers',
          name: 'Irrational Numbers',
          order: 3,
          questionCount: 10,
          level: 'expert',
          emoji: '🔴',
          label: 'Expert Level',
          range: '75–90+ marks',
          locked: true,
          isActive: true,
        },
      ],
    });

    // Create topics for Polynomials
    const polynomialsTopics = await prisma.topic.createMany({
      data: [
        {
          chapterId: polynomialsChapter.id,
          slug: 'degree-of-polynomial',
          name: 'Degree of Polynomial',
          order: 1,
          questionCount: 10,
          level: 'pass',
          emoji: '🟢',
          label: 'Pass Level',
          range: '35–50 marks',
          locked: false,
          isActive: true,
        },
        {
          chapterId: polynomialsChapter.id,
          slug: 'zeros-of-polynomial',
          name: 'Zeros of Polynomial',
          order: 2,
          questionCount: 10,
          level: 'average',
          emoji: '🔵',
          label: 'Average Level',
          range: '50–75 marks',
          locked: false,
          isActive: true,
        },
        {
          chapterId: polynomialsChapter.id,
          slug: 'graph-relation',
          name: 'Graph Relation',
          order: 3,
          questionCount: 10,
          level: 'expert',
          emoji: '🔴',
          label: 'Expert Level',
          range: '75–90+ marks',
          locked: true,
          isActive: true,
        },
      ],
    });
    console.log('Created topics:', realNumbersTopics.count + polynomialsTopics.count);
    
    // Get all topics for creating questions
    const allTopics = await prisma.topic.findMany();
    const topicsBySlug = {};
    allTopics.forEach(t => { topicsBySlug[t.slug] = t; });

    // Create questions for each topic and level
    let questionsCreated = 0;

    const questionTemplates = {
      pass: [
        {
          text: 'If p(x) = 3x² – 5x + 2, what is the degree of this polynomial?',
          options: ['1', '2', '3', '0'],
          correct: 1,
          explanation: 'The degree is the highest power of x. Here x² has power 2, so degree = 2.',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'A polynomial of degree 0 is called a:',
          options: ['Linear', 'Constant', 'Quadratic', 'Cubic'],
          correct: 1,
          explanation: 'A non-zero constant like p(x) = 5 has no variable, so degree 0 — it is a constant polynomial.',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'p(x) = x³ is a polynomial of degree:',
          options: ['1', '2', '3', '0'],
          correct: 2,
          explanation: 'The highest power of x in x³ is 3, so degree = 3.',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'Which of these is a linear polynomial?',
          options: ['x² + 1', 'x³', '2x + 5', 'x²'],
          correct: 2,
          explanation: 'A linear polynomial has degree 1. 2x + 5 has the highest power 1.',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'The zero of p(x) = 2x + 6 is:',
          options: ['3', '−3', '6', '−6'],
          correct: 1,
          explanation: '2x + 6 = 0 → x = –3.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'How many zeros can a quadratic polynomial have at most?',
          options: ['1', '3', '2', '4'],
          correct: 2,
          explanation: 'A quadratic polynomial (degree 2) can have at most 2 zeros.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'Which is NOT a polynomial?',
          options: ['3x² + 2x', '√x + 1', 'x³ – 1', '5'],
          correct: 1,
          explanation: '√x = x^(1/2) has a fractional exponent, so it is not a polynomial.',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'If one zero of x² – 5x + 6 is 2, the other zero is:',
          options: ['3', '−3', '1', '−2'],
          correct: 0,
          explanation: 'Sum of zeros = 5. So other zero = 5 – 2 = 3.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'The graph of y = p(x) cuts x-axis at 3 points. How many zeros?',
          options: ['1', '2', '3', '0'],
          correct: 2,
          explanation: 'Number of zeros = number of x-axis intersections = 3.',
          subtopicTag: 'Graph Relation',
        },
        {
          text: 'Which polynomial has zeros at x = –1 and x = 4?',
          options: ['x²+3x–4', 'x²–3x–4', 'x²+3x+4', 'x²–4x+1'],
          correct: 1,
          explanation: '(x+1)(x–4) = x² – 3x – 4.',
          subtopicTag: 'Zeros of Polynomial',
        },
      ],
      average: [
        {
          text: 'If sum of zeros of 2x² – kx + 3 is 4, find k.',
          options: ['4', '6', '8', '2'],
          correct: 2,
          explanation: 'Sum of zeros = k/2 = 4, so k = 8.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'Product of zeros of 3x² + 5x – 2 is:',
          options: ['5/3', '–2/3', '2/3', '–5/3'],
          correct: 1,
          explanation: 'Product = c/a = –2/3.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'If α and β are zeros of x²–3x+2, find α²+β².',
          options: ['5', '7', '9', '4'],
          correct: 0,
          explanation: 'α+β=3, αβ=2. α²+β²=(α+β)²–2αβ = 9–4 = 5.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'A quadratic polynomial with sum 3 and product –4 is:',
          options: ['x²–3x–4', 'x²+3x–4', 'x²–3x+4', 'x²+3x+4'],
          correct: 0,
          explanation: 'p(x) = x²–(sum)x+(product) = x²–3x–4.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'If graph of p(x) touches x-axis at one point, it has:',
          options: ['No zeros', '2 distinct zeros', '1 repeated zero', '3 zeros'],
          correct: 2,
          explanation: 'Touching (not crossing) the x-axis means a repeated zero.',
          subtopicTag: 'Graph Relation',
        },
        {
          text: 'The degree of a zero polynomial is:',
          options: ['0', '1', 'Not defined', '–1'],
          correct: 2,
          explanation: 'The zero polynomial p(x)=0 has no defined degree.',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'If zeros of x²+px+q are equal, then:',
          options: ['p²=4q', 'p²>4q', 'p²<4q', 'p=q'],
          correct: 0,
          explanation: 'Equal zeros means discriminant = 0: p²–4q=0 → p²=4q.',
          subtopicTag: 'Graph Relation',
        },
        {
          text: 'p(x) = (x–3)(x+2). Sum of zeros is:',
          options: ['5', '–5', '1', '–1'],
          correct: 2,
          explanation: 'Zeros are 3 and –2. Sum = 3+(–2) = 1.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'If α+β=6 and αβ=8, find α²+β².',
          options: ['20', '28', '36', '16'],
          correct: 0,
          explanation: 'α²+β²=(α+β)²–2αβ = 36–16 = 20.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'A cubic polynomial can have at most how many zeros?',
          options: ['1', '2', '3', '4'],
          correct: 2,
          explanation: 'A polynomial of degree n has at most n real zeros. Degree 3 → at most 3.',
          subtopicTag: 'Degree of Polynomial',
        },
      ],
      expert: [
        {
          text: 'If one zero of 2x²+3x+k is reciprocal of the other, find k.',
          options: ['1', '2', '1/2', '3'],
          correct: 1,
          explanation: 'If zeros are α and 1/α, product = α·(1/α) = 1 = k/2 → k=2.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'If zeros of x³–3x²–x+3 include 1 and –1, the third zero is:',
          options: ['3', '–3', '2', '–2'],
          correct: 0,
          explanation: 'Sum of zeros = 3. 1+(–1)+r = 3 → r = 3.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'For p(x)=ax²+bx+c, if both zeros are negative, then:',
          options: ['a,b,c same sign', 'a,c same sign, b opposite', 'a,b same sign, c opposite', 'No constraint'],
          correct: 0,
          explanation: 'Both zeros negative → sum<0 (b/a<0), product>0 (c/a>0), so all same sign.',
          subtopicTag: 'Graph Relation',
        },
        {
          text: 'A polynomial of degree n has exactly n zeros:',
          options: ['Always true', 'In complex numbers', 'Never true', 'Only for odd n'],
          correct: 1,
          explanation: 'Fundamental Theorem: every degree-n polynomial has exactly n zeros in ℂ (complex numbers).',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'If p(x) = x³–6x²+11x–6 has zeros 1,2,3 then p(4) =',
          options: ['6', '0', '–6', '24'],
          correct: 0,
          explanation: 'p(4) = 64–96+44–6 = 6.',
          subtopicTag: 'Graph Relation',
        },
        {
          text: 'A biquadratic polynomial has degree:',
          options: ['2', '3', '4', '5'],
          correct: 2,
          explanation: 'Biquadratic = 4th degree polynomial (bi=2, quadratic=2, so 2×2=4).',
          subtopicTag: 'Degree of Polynomial',
        },
        {
          text: 'If α,β,γ are zeros of x³+px+q, then α+β+γ =',
          options: ['p', '–p', '0', 'q'],
          correct: 2,
          explanation: 'For x³+0·x²+px+q, sum of zeros = –(coefficient of x²) = 0.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'The number of real zeros of p(x) = x²+4 is:',
          options: ['2', '1', '0', 'Cannot determine'],
          correct: 2,
          explanation: 'x²+4 = 0 → x²= –4, which has no real solutions.',
          subtopicTag: 'Graph Relation',
        },
        {
          text: 'If (x–k) is a factor of p(x), then p(k) =',
          options: ['k', '1', '0', '–k'],
          correct: 2,
          explanation: 'Factor Theorem: if (x–k) is a factor, then p(k) = 0.',
          subtopicTag: 'Zeros of Polynomial',
        },
        {
          text: 'For the graph of y=p(x) to not intersect x-axis, the discriminant must be:',
          options: ['= 0', '< 0', '> 0', '≥ 0'],
          correct: 1,
          explanation: 'No x-intercepts means no real zeros, which requires discriminant < 0.',
          subtopicTag: 'Graph Relation',
        },
      ],
    };

    // Create questions using Prisma create (to split options array properly)
    for (const topic of allTopics) {
      const templates = questionTemplates[topic.level] || questionTemplates.pass;
      for (let i = 0; i < 10; i++) {
        const template = templates[i % templates.length];
        await prisma.question.create({
          data: {
            topicId: topic.id,
            chapterId: topic.chapterId,
            level: topic.level,
            text: template.text,
            option1: template.options[0],
            option2: template.options[1],
            option3: template.options[2],
            option4: template.options[3],
            correctIndex: template.correct,
            explanation: template.explanation,
            subtopicTag: template.subtopicTag,
            difficulty: topic.level === 'pass' ? 1 : topic.level === 'average' ? 2 : 3,
            isActive: true,
          },
        });
        questionsCreated++;
      }
    }

    console.log('Created questions:', questionsCreated);
    console.log('Seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedData();
