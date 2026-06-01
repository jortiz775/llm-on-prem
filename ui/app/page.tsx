// ============================================================
// app/page.tsx
// ============================================================
// The root page — the only page in this single-page app.
//
// 'use client' makes this a Client Component, which means React
// can use hooks (useState, useEffect) and respond to user events.
// Without this directive, Next.js treats the file as a Server
// Component that runs only on the server and has no interactivity.
//
// This component owns all app state and passes it down to the
// Sidebar and ChatArea through props.
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import type { Conversation, Message, OllamaModel } from '../types'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'

// ---- Helpers ---------------------------------------------------

/** Creates a URL-safe random ID without any external library. */
function uid(): string {
  return crypto.randomUUID()
}

/** Builds a blank conversation shell ready to receive messages. */
function createConversation(model: string): Conversation {
  return {
    id: uid(),
    title: 'New Chat',
    messages: [],
    model,
    createdAt: new Date(),
  }
}

// ---- Component -------------------------------------------------

export default function Home() {
  // All conversations — persisted to localStorage so they survive a page refresh.
  const [conversations, setConversations] = useState<Conversation[]>([])

  // ID of the conversation currently shown in the chat area.
  const [activeId, setActiveId] = useState<string | null>(null)

  // List of models installed in Ollama (fetched on mount).
  const [models, setModels] = useState<OllamaModel[]>([])

  // Which model is selected in the sidebar dropdown.
  const [selectedModel, setSelectedModel] = useState('llama3')

  // True while we are reading a streaming response from /api/chat.
  const [isStreaming, setIsStreaming] = useState(false)

  // Whether Ollama responded successfully to the /api/models request.
  const [ollamaConnected, setOllamaConnected] = useState(false)

  // Derive the active conversation object from its ID.
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  // ---- On mount: load persisted conversations & query models ---
  useEffect(() => {
    // Restore conversations from localStorage so history survives refresh.
    const saved = localStorage.getItem('llm-conversations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Conversation[]
        // JSON.parse returns strings for Date fields — convert them back.
        const rehydrated = parsed.map((c) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }))
        setConversations(rehydrated)
        if (rehydrated.length > 0) setActiveId(rehydrated[0].id)
      } catch {
        // Corrupt localStorage data — start fresh.
        localStorage.removeItem('llm-conversations')
      }
    }

    // Fetch available Ollama models.
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models)
          setSelectedModel(data.models[0].name)
          setOllamaConnected(true)
        }
      })
      .catch(() => {
        // Ollama is not running — UI will show a warning in the sidebar.
      })
  }, []) // empty array = run only once when the component mounts

  // ---- Persist conversations whenever they change --------------
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('llm-conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  // ---- Start with one empty conversation if there are none -----
  useEffect(() => {
    if (conversations.length === 0) {
      const conv = createConversation(selectedModel)
      setConversations([conv])
      setActiveId(conv.id)
    }
  }, []) // only on mount — we don't want this to fire when selectedModel changes

  // ---- Actions -------------------------------------------------

  const handleNewConversation = () => {
    const conv = createConversation(selectedModel)
    // Prepend so the newest conversation appears at the top of the list.
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
  }

  /**
   * Sends the user's message to the backend, then reads the streaming
   * response token by token and appends each token to the assistant
   * message in state — producing the "typing" animation effect.
   */
  const handleSendMessage = async (content: string) => {
    if (!activeId || !content.trim() || isStreaming) return

    // Build the user message object.
    const userMessage: Message = {
      id: uid(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    // Pre-create an empty assistant message so the bubble appears
    // immediately with a loading indicator while we wait for tokens.
    const assistantMessageId = uid()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    // Capture the current conversation snapshot BEFORE the state update
    // so we can send its messages to the API.
    const currentConv = conversations.find((c) => c.id === activeId)
    const historyMessages = currentConv?.messages ?? []
    const model = currentConv?.model ?? selectedModel

    // Update state: append both messages and update the title if this
    // is the very first message in the conversation.
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c
        const isFirst = c.messages.length === 0
        return {
          ...c,
          // Truncate long prompts so the sidebar title stays readable.
          title: isFirst
            ? content.trim().slice(0, 42) + (content.length > 42 ? '…' : '')
            : c.title,
          messages: [...c.messages, userMessage, assistantMessage],
        }
      }),
    )

    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          // Build the messages array in the format Ollama expects.
          // We include the full history so the model has context.
          messages: [
            ...historyMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: content.trim() },
          ],
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Bad response from /api/chat')
      }

      // Read the response as a stream of bytes.
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      // Buffer for incomplete lines — a chunk boundary may split a JSON line.
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert bytes → string. { stream: true } handles multi-byte chars.
        buffer += decoder.decode(value, { stream: true })

        // Split on newlines. The last element may be an incomplete line
        // so we pop it back into the buffer to be completed next iteration.
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            // Each line is a JSON object: { message: { content: "..." }, done: bool }
            const parsed = JSON.parse(line)
            if (parsed.message?.content) {
              accumulated += parsed.message.content
              // Capture so the closure inside setConversations sees the right value.
              const snap = accumulated
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== activeId) return c
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: snap } : m,
                    ),
                  }
                }),
              )
            }
          } catch {
            // Ignore lines that aren't valid JSON (e.g. empty lines).
          }
        }
      }
    } catch {
      // Replace the empty assistant message with an error notice.
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content:
                      '⚠️ Could not reach Ollama. Make sure it is running:\n\n```\nollama serve\n```',
                  }
                : m,
            ),
          }
        }),
      )
    } finally {
      // Always turn off the loading state when the stream ends — success or failure.
      setIsStreaming(false)
    }
  }

  // ---- Render --------------------------------------------------

  return (
    // Full-screen flex row: sidebar on the left, chat on the right.
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        models={models}
        selectedModel={selectedModel}
        ollamaConnected={ollamaConnected}
        onSelectConversation={setActiveId}
        onNewConversation={handleNewConversation}
        onSelectModel={setSelectedModel}
      />
      <ChatArea
        conversation={activeConversation}
        isStreaming={isStreaming}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}
