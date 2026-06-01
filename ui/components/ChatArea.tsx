// ============================================================
// components/ChatArea.tsx
// ============================================================
// The main content area to the right of the sidebar.
// Contains:
//   • Empty state (when no messages exist yet)
//   • Scrollable messages list
//   • Input bar at the bottom (grows with text, Enter to send)
// ============================================================

'use client'

import { useEffect, useRef, useState } from 'react'
import type { Conversation } from '../types'
import MessageBubble from './MessageBubble'

// Quick-start prompts shown on the empty state screen.
// Clicking one pre-fills the input — lowers the barrier to first use.
const STARTER_PROMPTS = [
  'Explain quantum computing in simple terms.',
  'Write a Python function that validates an email address.',
  'What are the pros and cons of microservices architecture?',
  'Help me write a professional email declining a meeting.',
]

interface ChatAreaProps {
  conversation: Conversation | null
  isStreaming: boolean
  onSendMessage: (content: string) => void
}

export default function ChatArea({ conversation, isStreaming, onSendMessage }: ChatAreaProps) {
  // Controlled input value
  const [input, setInput] = useState('')

  // Ref to the invisible div at the bottom of the messages list —
  // scrolling it into view keeps the latest message visible.
  const bottomRef = useRef<HTMLDivElement>(null)

  // Ref to the textarea so we can focus it programmatically.
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom whenever a new message arrives or a token is added.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  // Auto-resize the textarea height to fit the typed text.
  // We reset to 'auto' first to shrink the box when text is deleted.
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight}px`
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    onSendMessage(input)
    setInput('')
    // Reset textarea height after clearing
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter alone → send. Shift+Enter → new line.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const useStarterPrompt = (prompt: string) => {
    setInput(prompt)
    // Focus the textarea so the user can edit or just hit Enter.
    textareaRef.current?.focus()
  }

  const messages = conversation?.messages ?? []
  const isEmpty = messages.length === 0

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f]">

      {/* ---- Messages area ------------------------------------- */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Empty state — shown before the first message is sent */
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            {/* Glowing icon */}
            <div
              className="
                w-16 h-16 rounded-2xl mb-6
                bg-indigo-500/10 border border-indigo-500/20
                flex items-center justify-center
                shadow-xl shadow-indigo-500/10
              "
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-white mb-2">
              What can I help with?
            </h1>
            <p className="text-sm text-zinc-500 max-w-xs mb-8">
              Running on your hardware. Nothing leaves this machine.
            </p>

            {/* Starter prompt chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => useStarterPrompt(prompt)}
                  className="
                    text-left px-4 py-3 rounded-xl text-xs text-zinc-400
                    bg-[#0f0f17] border border-[#1e1e2e]
                    hover:border-indigo-500/30 hover:text-zinc-200
                    transition-all duration-150
                  "
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message list */
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                // Only the last message gets the streaming cursor
                isStreaming={
                  isStreaming &&
                  index === messages.length - 1 &&
                  message.role === 'assistant'
                }
              />
            ))}
            {/* Invisible anchor we scroll to */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ---- Input bar ----------------------------------------- */}
      <div className="border-t border-[#1e1e2e] p-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="
              flex items-end gap-3
              bg-[#16161f] border border-[#252535] rounded-2xl
              px-4 py-3
              focus-within:border-indigo-500/40
              transition-colors duration-150
            "
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message… (Enter to send · Shift+Enter for new line)"
              rows={1}
              className="
                flex-1 bg-transparent text-sm text-white
                placeholder-zinc-600 focus:outline-none
                max-h-48 leading-relaxed
              "
            />

            {/* Send / Stop button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              className="
                shrink-0 w-8 h-8 rounded-xl
                bg-indigo-500 hover:bg-indigo-400
                disabled:bg-[#252535] disabled:cursor-not-allowed
                flex items-center justify-center
                transition-colors duration-150
                shadow shadow-indigo-500/20
              "
            >
              {isStreaming ? (
                /* Pulsing square = "generating" indicator */
                <span className="w-3 h-3 rounded-sm bg-white/60 animate-pulse" />
              ) : (
                /* Send arrow icon */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-zinc-700 mt-2">
            Local model · no internet connection required
          </p>
        </div>
      </div>
    </main>
  )
}
