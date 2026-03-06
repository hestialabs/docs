/**
 * Supabase Database Integration
 * Handles documentation indexing and AI assistant context retrieval
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface DocumentationRecord {
  id: string;
  page_id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  searchable_text: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  context_page?: string;
  created_at: string;
}

/**
 * Index a documentation page in Supabase for full-text search
 */
export async function indexDocumentation(
  pageId: string,
  title: string,
  description: string,
  content: string,
  category: string,
  searchableText: string
) {
  const { data, error } = await supabase
    .from('documentation')
    .upsert({
      page_id: pageId,
      title,
      description,
      content,
      category,
      searchable_text: searchableText,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) throw new Error(`Failed to index documentation: ${error.message}`);
  return data;
}

/**
 * Full-text search documentation
 */
export async function searchDocumentation(
  query: string,
  limit: number = 10
) {
  const { data, error } = await supabase
    .rpc('search_documentation', {
      search_query: query,
      result_limit: limit,
    });

  if (error) throw new Error(`Search failed: ${error.message}`);
  return data as DocumentationRecord[];
}

/**
 * Get documentation by page ID
 */
export async function getDocumentationByPageId(pageId: string) {
  const { data, error } = await supabase
    .from('documentation')
    .select('*')
    .eq('page_id', pageId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch documentation: ${error.message}`);
  }
  return data as DocumentationRecord | null;
}

/**
 * Get all documentation pages for a category
 */
export async function getDocumentationByCategory(category: string) {
  const { data, error } = await supabase
    .from('documentation')
    .select('*')
    .eq('category', category);

  if (error) throw new Error(`Failed to fetch category: ${error.message}`);
  return data as DocumentationRecord[];
}

/**
 * Save conversation message
 */
export async function saveConversationMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  contextPage?: string
) {
  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      context_page: contextPage,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) throw new Error(`Failed to save message: ${error.message}`);
  return data;
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string) {
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch conversation: ${error.message}`);
  return data as ConversationMessage[];
}

/**
 * Initialize database tables (runs once during setup)
 */
export async function initializeTables() {
  try {
    // Documentation table
    const { error: docError } = await supabase.rpc('create_documentation_table');
    if (docError && !docError.message.includes('already exists')) {
      console.error('Failed to create documentation table:', docError);
    }

    // Conversation messages table
    const { error: convError } = await supabase.rpc('create_conversation_table');
    if (convError && !convError.message.includes('already exists')) {
      console.error('Failed to create conversation table:', convError);
    }

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}
