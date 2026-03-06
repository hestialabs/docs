/**
 * Docs AI Assistant API Route
 * Streams contextual responses using Groq AI with documentation context
 */

import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { searchDocumentation } from '@/lib/supabase';
import { getCachedAIResponse, cacheAIResponse, getCachedSearchResults, cacheSearchResults } from '@/lib/cache';
import { allPages, searchPages } from '@/content/docs';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    const userMessage = messages[messages.length - 1];
    const userQuery = typeof userMessage.content === 'string' 
      ? userMessage.content 
      : userMessage.content[0]?.text || '';

    // Try to get cached AI response
    if (conversationId) {
      const cached = await getCachedAIResponse(conversationId, userQuery);
      if (cached) {
        return new Response(
          `data: ${JSON.stringify(cached)}\ndata: [DONE]\n`,
          {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          }
        );
      }
    }

    // Search documentation for context
    let contextDocs = '';
    let searchResults = null;

    try {
      // First try Redis cache
      searchResults = await getCachedSearchResults(userQuery);

      // If not cached, search in both local docs and Supabase
      if (!searchResults) {
        const localResults = searchPages(userQuery).slice(0, 5);
        
        try {
          const dbResults = await searchDocumentation(userQuery, 5);
          searchResults = [...localResults, ...dbResults];
        } catch (dbError) {
          console.warn('Database search failed, using local search:', dbError);
          searchResults = localResults;
        }

        // Cache the search results
        await cacheSearchResults(userQuery, searchResults);
      }

      // Build context from search results
      if (searchResults && searchResults.length > 0) {
        contextDocs = searchResults
          .slice(0, 3)
          .map((result: any) => `# ${result.title}\n${result.description}\n${result.content?.slice(0, 500) || ''}`)
          .join('\n\n---\n\n');
      }
    } catch (searchError) {
      console.error('Search error:', searchError);
    }

    // Create the system prompt
    const systemPrompt = `You are an expert assistant for Hestia Labs documentation. You help users understand the system architecture, protocol, security model, and operational procedures.

Your core responsibilities:
1. Provide accurate, detailed explanations of Hestia Labs concepts
2. Cite specific sections from documentation when relevant
3. Explain complex topics in clear, structured ways
4. Reference architectural diagrams and flows when applicable
5. Highlight security implications when discussing system design
6. Provide practical examples from the documentation

Context Rules:
- If the user question relates to the documentation below, use that context
- If you're unsure about something, say so and recommend checking the documentation
- Always explain the "why" behind design decisions
- Reference the status (Specified vs Planned) when discussing features

Relevant Documentation Context:
${contextDocs || 'No specific documentation context found for this query.'}

Be concise but thorough. Structure complex answers with headers and bullet points.`;

    // Stream response using Groq
    const result = streamText({
      model: groq('mixtral-8x7b-32768'),
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : msg.content[0]?.text || '',
      })),
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Optionally cache the response
    result.onFinish?.((completion) => {
      if (conversationId && completion.text) {
        cacheAIResponse(conversationId, userQuery, {
          message: completion.text,
          citations: [],
        });
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Assistant API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
