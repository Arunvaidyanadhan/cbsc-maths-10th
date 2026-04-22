// Navigation context preservation utility

const CONTEXT_KEYS = {
  LAST_CHAPTER_ID: 'rithamio_lastChapterId',
  LAST_TOPIC_ID: 'rithamio_lastTopicId',
  LAST_MODE_SLUG: 'rithamio_lastModeSlug',
  LAST_TOPIC_AT: 'rithamio_lastTopicAt',
  LAST_MODE_AT: 'rithamio_lastModeAt',
  LAST_PAGE: 'rithamio_lastPage',
  SESSION_START_TIME: 'rithamio_sessionStartTime'
};

export const NavigationContext = {
  // Save context
  saveContext: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to save navigation context:', error);
    }
  },

  // Get context
  getContext: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get navigation context:', error);
      return null;
    }
  },

  // Clear context
  clearContext: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear navigation context:', error);
    }
  },

  // Save last activity
  saveLastActivity: (type, id) => {
    switch (type) {
      case 'chapter':
        NavigationContext.saveContext(CONTEXT_KEYS.LAST_CHAPTER_ID, id);
        break;
      case 'topic':
        NavigationContext.saveContext(CONTEXT_KEYS.LAST_TOPIC_ID, id);
        NavigationContext.saveContext(CONTEXT_KEYS.LAST_TOPIC_AT, Date.now().toString());
        break;
      case 'mode':
        NavigationContext.saveContext(CONTEXT_KEYS.LAST_MODE_SLUG, id);
        NavigationContext.saveContext(CONTEXT_KEYS.LAST_MODE_AT, Date.now().toString());
        break;
      case 'page':
        NavigationContext.saveContext(CONTEXT_KEYS.LAST_PAGE, id);
        break;
    }
  },

  // Get last activity
  getLastActivity: () => {
    return {
      chapterId: NavigationContext.getContext(CONTEXT_KEYS.LAST_CHAPTER_ID),
      topicId: NavigationContext.getContext(CONTEXT_KEYS.LAST_TOPIC_ID),
      modeSlug: NavigationContext.getContext(CONTEXT_KEYS.LAST_MODE_SLUG),
      topicAt: parseInt(NavigationContext.getContext(CONTEXT_KEYS.LAST_TOPIC_AT) || '0', 10),
      modeAt: parseInt(NavigationContext.getContext(CONTEXT_KEYS.LAST_MODE_AT) || '0', 10),
      page: NavigationContext.getContext(CONTEXT_KEYS.LAST_PAGE)
    };
  },

  getRecentPracticeTarget: () => {
    const lastActivity = NavigationContext.getLastActivity();

    if (lastActivity.topicId && lastActivity.modeSlug) {
      return lastActivity.topicAt >= lastActivity.modeAt
        ? { type: 'topic', id: lastActivity.topicId }
        : { type: 'mode', id: lastActivity.modeSlug };
    }

    if (lastActivity.topicId) {
      return { type: 'topic', id: lastActivity.topicId };
    }

    if (lastActivity.modeSlug) {
      return { type: 'mode', id: lastActivity.modeSlug };
    }

    return null;
  },

  // Get smart next suggestion based on context
  getNextSuggestion: (score = null, accuracy = null) => {
    const lastActivity = NavigationContext.getLastActivity();
    
    if (score !== null && accuracy !== null) {
      // Smart suggestions based on performance
      if (accuracy < 50) {
        return {
          text: 'Try the same topic again',
          href: lastActivity.topicId ? `/practice/${lastActivity.topicId}` : '/chapters',
          icon: '??',
          reason: 'Low score - practice makes perfect!'
        };
      } else if (accuracy <= 80) {
        return {
          text: 'Try a practice mode',
          href: '/practice-modes',
          icon: '??',
          reason: 'Good progress - try a focused practice!'
        };
      } else {
        return {
          text: 'Continue learning',
          href: lastActivity.chapterId ? `/chapter/${lastActivity.chapterId}` : '/chapters',
          icon: '??',
          reason: 'Great work! Ready for the next topic!'
        };
      }
    }

    // Fallback suggestions based on last activity
    if (lastActivity.topicId) {
      return {
        text: 'Continue practice',
        href: `/practice/${lastActivity.topicId}`,
        icon: '??',
        reason: 'Pick up where you left off'
      };
    }

    if (lastActivity.modeSlug) {
      return {
        text: 'Try practice mode',
        href: `/practice-mode/${lastActivity.modeSlug}`,
        icon: '??',
        reason: 'Challenge yourself with focused practice'
      };
    }

    return {
      text: 'Start learning',
      href: '/chapters',
      icon: '??',
      reason: 'Begin your learning journey'
    };
  },

  // Track session start time
  trackSessionStart: () => {
    NavigationContext.saveContext(CONTEXT_KEYS.SESSION_START_TIME, Date.now().toString());
  },

  // Get session duration
  getSessionDuration: () => {
    const startTime = NavigationContext.getContext(CONTEXT_KEYS.SESSION_START_TIME);
    if (!startTime) return 0;
    
    return Math.floor((Date.now() - parseInt(startTime)) / 1000 / 60); // minutes
  }
};

// Navigation progress bar manager
export const NavigationProgress = {
  start: () => {
    const loader = document.getElementById('topLoader');
    if (loader) {
      loader.style.width = '30%';
    }
  },

  progress: () => {
    const loader = document.getElementById('topLoader');
    if (loader) {
      loader.style.width = '70%';
    }
  },

  complete: () => {
    const loader = document.getElementById('topLoader');
    if (loader) {
      loader.style.width = '100%';
      setTimeout(() => {
        loader.style.width = '0%';
      }, 300);
    }
  }
};

// Smart navigation hook for React components
export const useSmartNavigation = () => {
  const navigateWithProgress = (href) => {
    NavigationProgress.start();
    setTimeout(() => {
      NavigationProgress.progress();
      window.location.href = href;
      setTimeout(() => {
        NavigationProgress.complete();
      }, 100);
    }, 100);
  };

  return {
    navigateWithProgress,
    saveLastActivity: NavigationContext.saveLastActivity,
    getLastActivity: NavigationContext.getLastActivity,
    getNextSuggestion: NavigationContext.getNextSuggestion
  };
};
