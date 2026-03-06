'use server';

/**
 * Server Actions for AI Assistant
 * Handles server-side operations for the documentation assistant
 */

import { searchDocumentation, saveConversationMessage, getConversationHistory } from '@/lib/supabase';
import { searchPages } from '@/content/docs';
import {
  getCachedSearchResults,
  cacheSearchResults,
  getCachedAIResponse,
  CACHE_DURATIONS,
} from '@/lib/cache';

/**
 * Search documentation and return results
 */
export async function serverSearchDocs(query: string, limit: number = 10) {
  try {
    // Check cache first
    const cached = await getCachedSearchResults(query);
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
      };
    }

    // Search local docs
    const localResults = searchPages(query).slice(0, limit);

    // Try to search database
    let dbResults = [];
    try {
      dbResults = await searchDocumentation(query, limit);
    } catch (dbError) {
      console.warn('Database search failed, using local results:', dbError);
    }

    // Combine and deduplicate
    const combined = [...localResults, ...dbResults];
    const unique = Array.from(
      new Map(combined.map((item: any) => [item.id, item])).values()
    ).slice(0, limit);

    // Cache results
    await cacheSearchResults(query, unique);

    return {
      success: true,
      data: unique,
      cached: false,
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: 'Search failed',
    };
  }
}

/**
 * Save assistant message to conversation history
 */
export async function serverSaveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  contextPage?: string
) {
  try {
    const result = await saveConversationMessage(conversationId, role, content, contextPage);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Failed to save message:', error);
    return {
      success: false,
      error: 'Failed to save message',
    };
  }
}

/**
 * Get conversation history
 */
export async function serverGetConversationHistory(conversationId: string) {
  try {
    const history = await getConversationHistory(conversationId);
    return {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    return {
      success: false,
      error: 'Failed to fetch conversation',
    };
  }
}

/**
 * Get assistant suggestions based on current page
 */
export async function getAssistantSuggestions(pageId?: string) {
  const suggestions = [
    {
      question: 'What is the authority chain?',
      category: 'architecture',
      pageId: 'architecture/authority-chain',
    },
    {
      question: 'How does the Safety Service work?',
      category: 'architecture',
      pageId: 'architecture/safety-enforcement',
    },
    {
      question: 'Explain capability-based execution',
      category: 'architecture',
      pageId: 'architecture/capability-manifest',
    },
    {
      question: 'What are the security invariants?',
      category: 'security',
      pageId: 'security/invariants',
    },
    {
      question: 'How are cryptographic keys managed?',
      category: 'security',
      pageId: 'security/cryptographic-model',
    },
    {
      question: 'What happens during a dispatch pipeline?',
      category: 'protocol',
      pageId: 'protocol/dispatch-pipeline',
    },
  ];

  // Filter suggestions based on current page
  if (pageId) {
    return suggestions.filter((s) => s.pageId === pageId).slice(0, 3);
  }

  return suggestions.slice(0, 3);
}
