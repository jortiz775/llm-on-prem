// ============================================================
// components/Sidebar.tsx
// ============================================================
// The left sidebar contains:
//   • Brand header
//   • "New Chat" button
//   • Model selector (populated from locally installed Ollama models)
//   • Scrollable list of past conversations
//   • Footer with a privacy reminder
// ============================================================

'use client'

import type { Conversation, OllamaModel } from '../types'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  models: OllamaModel[]
  selectedModel: string
  ollamaConnected: boolean
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onSelectModel: (model: string) => void
}

export default function Sidebar({
  conversations,
  activeId,
  models,
  selectedModel,
  ollamaConnected,
  onSelectConversation,
  onNewConversation,
  onSelectModel,
}: SidebarProps) {
  return (
    // shrink-0 prevents the sidebar from squishing when the chat area grows
    <aside className="w-64 shrink-0 flex flex-col bg-[#0f0f17] border-r border-[#1e1e2e]">

      {/* ---- Header ------------------------------------------- */}
      <div className="p-4 border-b border-[#1e1e2e]">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="
              w-8 h-8 rounded-xl
              bg-gradient-to-br from-indigo-500 to-violet-600
              flex items-center justify-center
              text-xs font-black text-white shadow-lg shadow-indigo-500/20
            "
          >
            AI
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">LLM On-Prem</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">local & private</p>
          </div>
        </div>

        {/* New chat button */}
        <button
          onClick={onNewConversation}
          className="
            w-full flex items-center justify-center gap-2 px-3 py-2
            rounded-xl bg-indigo-500 hover:bg-indigo-400
            text-white text-sm font-medium
            transition-colors duration-150 shadow shadow-indigo-500/30
          "
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>

      {/* ---- Model selector ------------------------------------ */}
      <div className="px-3 pt-4 pb-2">
        <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1.5">
          Model
        </label>

        {/*
          If Ollama is not running, models will be empty.
          We show a disabled select with a warning so the user knows what to do.
        */}
        {ollamaConnected ? (
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="
              w-full bg-[#16161f] border border-[#252535] rounded-lg
              px-3 py-2 text-sm text-zinc-200
              focus:outline-none focus:border-indigo-500/60
              transition-colors cursor-pointer
            "
          >
            {models.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="bg-[#16161f] border border-amber-500/20 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-400/80">Ollama not detected.</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Run: ollama serve</p>
          </div>
        )}
      </div>

      {/* ---- Conversation history ------------------------------ */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <p className="px-2 mb-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
          History
        </p>

        {conversations.length === 0 && (
          <p className="px-2 text-xs text-zinc-600 italic">No conversations yet.</p>
        )}

        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            title={conv.title}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-xs mb-0.5 truncate
              transition-colors duration-100
              ${conv.id === activeId
                ? 'bg-[#1e1e2e] text-white'
                : 'text-zinc-500 hover:bg-[#16161f] hover:text-zinc-300'
              }
            `}
          >
            {conv.title}
          </button>
        ))}
      </div>

      {/* ---- Footer -------------------------------------------- */}
      <div className="p-3 border-t border-[#1e1e2e]">
        <p className="text-[10px] text-zinc-700 text-center leading-relaxed">
          Powered by{' '}
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500/70 hover:text-indigo-400 transition-colors"
          >
            Ollama
          </a>
          {' '}· no data leaves this machine
        </p>
      </div>
    </aside>
  )
}
