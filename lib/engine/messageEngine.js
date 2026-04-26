/**
 * Message Engine
 * Priority-based message selection with anti-repetition logic
 * Returns personalized messages based on user performance
 * Execution time < 10ms (1 DB read + 1 DB write max)
 */

import prisma from '../prisma.js';
import { getPerformanceLevel, selectCategory } from '../messages/messageLibrary.js';

/**
 * Format subtopic tag into readable title for personalization
 * @param {string} tag - Raw subtopic tag
 * @returns {string} Readable title
 */
function formatSubtopicTag(tag) {
  if (!tag) return '';

  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get non-repeating message from pool
 * Filters out recently used messages, resets if all filtered
 *
 * @param {Array} messages - Pool of message objects
 * @param {Array} lastMessages - Array of recently used message texts
 * @returns {Object} Selected message object
 */
function getNonRepeatingMessage(messages, lastMessages) {
  // Filter out recently used messages (compare by text)
  let available = messages.filter(m => !lastMessages.includes(m.text));

  // If all messages filtered out, reset cycle
  if (available.length === 0) {
    available = messages;
  }

  // Pick random from available
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Apply light personalization to message
 * Appends weak area focus if available
 *
 * @param {Object} message - Base message object
 * @param {Array} weakAreas - User's weak areas
 * @returns {string} Personalized message text
 */
function personalizeMessage(message, weakAreas) {
  let text = message.text;

  // Add weak area focus if available
  if (weakAreas?.length > 0 && weakAreas[0]?.subtopicTag) {
    const topicName = formatSubtopicTag(weakAreas[0].subtopicTag);
    if (topicName) {
      text += ` Focus more on ${topicName}.`;
    }
  }

  return text;
}

/**
 * Get dynamic personalized message for user
 * Priority-based selection with anti-repetition and personalization
 *
 * @param {Object} params - Input parameters
 * @param {string} params.userId - User ID
 * @param {number} params.score - Score percentage (0-100)
 * @param {number} params.trend - Performance trend
 * @param {string} params.confidence - Confidence level (High/Medium/Low)
 * @param {Array} params.weakAreas - User's weak areas
 * @returns {Promise<string>} Selected personalized message text
 */
export async function getDynamicMessage({
  userId,
  score,
  trend,
  confidence,
  weakAreas
}) {
  try {
    // Step 1: Determine performance level
    const performanceLevel = getPerformanceLevel(score);

    // Step 2: Select category based on strict priority
    const selectedCategory = selectCategory({ confidence, trend, performanceLevel });

    // Step 3: Fetch user's message history (use findFirst, not findUnique)
    const history = await prisma.userMessageHistory.findFirst({
      where: { userId },
      select: { id: true, lastMessages: true }
    });

    const lastMessages = history?.lastMessages || [];

    // Step 4: Get non-repeating message from selected category
    const selectedMessage = getNonRepeatingMessage(selectedCategory.messages, lastMessages);

    // Step 5: Personalize message with weak area
    const personalizedText = personalizeMessage(selectedMessage, weakAreas);

    // Step 6: Update history (keep only last 3 messages)
    const updatedLast3 = [...lastMessages, selectedMessage.text].slice(-3);

    await prisma.userMessageHistory.upsert({
      where: { id: history?.id || 'new' },
      update: { lastMessages: updatedLast3 },
      create: {
        userId,
        lastMessages: updatedLast3
      }
    });

    return personalizedText;
  } catch (error) {
    console.error('Message engine error:', error);
    // Fallback to safe static message
    return "You're making progress. Keep practicing consistently.";
  }
}

/**
 * Get quick message without database update
 * Useful for testing or when history tracking is not needed
 *
 * @param {number} score - Score percentage
 * @param {string} confidence - Confidence level
 * @param {number} trend - Performance trend
 * @param {Array} weakAreas - User's weak areas
 * @returns {string} Message text
 */
export function getQuickMessage(score, confidence, trend, weakAreas) {
  const performanceLevel = getPerformanceLevel(score);
  const selectedCategory = selectCategory({ confidence, trend, performanceLevel });
  const messages = selectedCategory.messages;

  const randomIndex = Math.floor(Math.random() * messages.length);
  const message = messages[randomIndex];

  return personalizeMessage(message, weakAreas);
}
