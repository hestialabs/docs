/**
 * Content Type Definitions for Hestia Labs Documentation
 * Provides strict type safety for all documentation pages and structure
 */

export interface DocPage {
  id: string;
  title: string;
  description: string;
  content: string;
  category: DocCategory;
  subcategory?: string;
  lastUpdated: Date;
  status: 'specified' | 'planned';
  relatedPages: string[];
  searchableText: string;
  frontmatter?: Record<string, any>;
}

export type DocCategory =
  | 'foundations'
  | 'architecture'
  | 'protocol'
  | 'security'
  | 'operations'
  | 'reference';

export interface DocSection {
  category: DocCategory;
  name: string;
  pages: DocPage[];
}

export interface NavTab {
  tab: string;
  groups: NavGroup[];
}

export interface NavGroup {
  group: string;
  pages: string[];
}

export interface DocsConfig {
  theme: string;
  name: string;
  colors: {
    primary: string;
    light: string;
    dark: string;
  };
  favicon: string;
  logo: {
    light: string;
    dark: string;
  };
  navigation: {
    tabs: NavTab[];
    global: {
      anchors: NavAnchor[];
    };
  };
  navbar: {
    links: NavAnchor[];
  };
  footer: {
    socials: Record<string, string>;
  };
}

export interface NavAnchor {
  anchor: string;
  href: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: DocCategory;
  relevance: number;
  excerpt: string;
}

export interface AIAssistantContext {
  currentPage?: DocPage;
  searchResults?: SearchResult[];
  userQuery: string;
  conversationHistory: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: Partial<DocPage>;
}

export interface AssistantResponse {
  message: string;
  citations: string[];
  relatedPages: DocPage[];
  confidence: number;
}
