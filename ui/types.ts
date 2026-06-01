// ============================================================
// types.ts
// ============================================================
// Shared TypeScript types used across the entire UI.
// These describe the shape of data in memory — they are erased
// at build time and cost nothing at runtime.
// ============================================================

/** Who sent a message in the conversation. */
export type Role = 'user' | 'assistant' | 'system'

/** A single chat message — either from the user or the AI. */
export interface Message {
  /** Unique identifier so React can track this item in a list. */
  id: string
  role: Role
  /** The actual text content. Starts as '' for streaming AI replies. */
  content: string
  /** When the message was created (stored so we can display timestamps). */
  timestamp: Date
}

/** A full conversation thread — a title + all its messages. */
export interface Conversation {
  id: string
  /** Short title derived from the first user message. */
  title: string
  messages: Message[]
  /** Which Ollama model was selected when this conversation started. */
  model: string
  createdAt: Date
}

/** One model entry returned by GET /api/models (proxied from Ollama). */
export interface OllamaModel {
  name: string
  modified_at: string
  size: number
}
