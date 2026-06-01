// ============================================================
// components/MessageBubble.tsx
// ============================================================
// Renders a single chat message — either the user's text or the
// AI's response. The two styles are visually distinct:
//
//   User     → right-aligned, indigo-to-violet gradient bubble
//   Assistant → left-aligned, dark card with AI avatar and a
//               blinking cursor while the response is streaming
// ============================================================

import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  /** True only for the last assistant message while tokens are arriving. */
  isStreaming: boolean
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  // ---- User message -------------------------------------------
  if (isUser) {
    return (
      // animate-fade-up gives a subtle entrance animation defined in tailwind.config.ts
      <div className="flex justify-end animate-fade-up">
        <div
          className="
            max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm
            bg-gradient-to-br from-indigo-500 to-violet-600
            text-white text-sm leading-relaxed whitespace-pre-wrap shadow-lg
          "
        >
          {message.content}
        </div>
      </div>
    )
  }

  // ---- Assistant message --------------------------------------
  return (
    <div className="flex gap-3 animate-fade-up">
      {/* Small avatar badge in the model's brand color */}
      <div
        className="
          w-7 h-7 rounded-lg shrink-0 mt-0.5
          bg-indigo-500/20 border border-indigo-500/30
          flex items-center justify-center
          text-[10px] font-bold text-indigo-400
        "
      >
        AI
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-1.5 font-medium tracking-wide">Assistant</p>

        {/*
          message-content class (defined in globals.css) adds prose-like
          spacing to paragraphs and code blocks within the response.
        */}
        <div className="message-content text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
          {/* Show placeholder dots if Ollama hasn't returned any text yet */}
          {message.content || (isStreaming && (
            <span className="flex gap-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:300ms]" />
            </span>
          ))}

          {/*
            Blinking cursor rendered at the end of the text while streaming.
            animate-blink is defined in tailwind.config.ts.
          */}
          {isStreaming && message.content && (
            <span
              className="
                inline-block w-[2px] h-[1em] bg-indigo-400 ml-0.5 rounded-full
                align-middle animate-blink
              "
            />
          )}
        </div>
      </div>
    </div>
  )
}
