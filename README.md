# LLM On-Prem

A private sandbox for running, testing, and deploying local large language models (LLMs) without sending data to any external service.

Built on top of [Ollama](https://ollama.com) with a custom Next.js chat UI, focusing on:

- **Privacy** — everything runs on your own hardware, nothing leaves the machine
- **RAG** (Retrieval-Augmented Generation) — chat with your own documents
- **Fine-tuning** — adapt open-source models to a specific domain using QLoRA
- **Client deployability** — structured so it can be replicated in a company environment

---

## Stack

| Layer | Tool |
|---|---|
| Model runner | [Ollama](https://ollama.com) |
| Chat UI | Custom Next.js 15 + Tailwind CSS (`ui/`) |
| RAG framework | LangChain / LlamaIndex |
| Vector store | ChromaDB |
| Fine-tuning | Unsloth + QLoRA |
| Orchestration | Docker + docker-compose |

---

## Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| GPU VRAM | 8 GB | 12 GB+ |
| RAM | 16 GB | 32 GB |
| Storage | 50 GB free | 200 GB+ |

> Tested on: AMD Ryzen 7 7700X · 32 GB RAM · NVIDIA RTX 4070 Ti (12 GB VRAM)

---

## Quick Start

### Step 1 — Install Ollama

Download the installer from [ollama.com](https://ollama.com) (Windows/Mac/Linux) and run it.  
On Windows you can also use winget:

```powershell
winget install Ollama.Ollama
```

### Step 2 — Pull a model

Open a **new** terminal (so the updated PATH is picked up) and pull at least one model:

```powershell
# Good all-rounder — 8B params, ~4.7 GB download (recommended first pick)
ollama pull llama3

# Fast and accurate — 7B params, ~4.1 GB
ollama pull mistral

# Tiny but capable — 3.8B params, ~2.3 GB (great for low-VRAM machines)
ollama pull phi3
```

> Models are stored in `~/.ollama/models` by default.  
> With a 12 GB VRAM GPU, llama3 and mistral run **fully on GPU** (~30–50 tok/s).

### Step 3 — Start Ollama

```powershell
ollama serve
```

Leave this terminal open. Ollama listens on `http://localhost:11434`.  
> On Windows, the installer also adds an Ollama tray icon that starts the server automatically on login.

### Step 4 — Run the Chat UI

In a **second** terminal:

```powershell
cd ui
npm install        # first time only
npm run dev
```

Open **http://localhost:3000** — the sidebar will show your installed models and you can start chatting immediately. Conversation history is saved in the browser (localStorage) and survives page refreshes.

---

## Ollama Configuration

All settings are controlled via environment variables set **before** `ollama serve`.

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_HOST` | `127.0.0.1:11434` | Address Ollama listens on |
| `OLLAMA_ORIGINS` | `http://localhost` | Allowed CORS origins (`*` = all) |
| `OLLAMA_MODELS` | `~/.ollama/models` | Where downloaded models are stored |
| `OLLAMA_KEEP_ALIVE` | `5m` | How long a model stays loaded in VRAM after last use |
| `OLLAMA_NUM_PARALLEL` | `1` | Max concurrent inference requests |
| `OLLAMA_MAX_LOADED_MODELS` | `1` | Max models kept in VRAM at once |

**Useful commands:**

```powershell
ollama list              # all downloaded models
ollama ps                # models currently loaded in VRAM
ollama show llama3       # model info (parameters, context length)
ollama show llama3 --modelfile   # full Modelfile (system prompt, options)
ollama rm llama3         # delete a model
```

**Set persistent env vars (Windows):**

```powershell
# Keep model in VRAM for 30 minutes between requests
[System.Environment]::SetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "30m", "User")

# Allow larger context window (uses more VRAM — safe on RTX 4070 Ti)
# Pass per-request in the API body: { "options": { "num_ctx": 8192 } }
```

**Create a custom model variant:**

```
# Modelfile
FROM llama3
SYSTEM "You are a concise assistant. Answer in plain English, no jargon."
PARAMETER temperature 0.7
PARAMETER num_ctx 8192
```

```powershell
ollama create my-llama -f Modelfile
ollama run my-llama
```

---

## Project Structure

```
llm-on-prem/
├── ui/                          # Custom Next.js 15 chat interface
│   ├── app/
│   │   ├── page.tsx             # Root page — manages all app state
│   │   ├── layout.tsx           # HTML shell, metadata
│   │   ├── globals.css          # Tailwind base + custom scrollbar
│   │   └── api/
│   │       ├── chat/route.ts    # Proxies streaming chat to Ollama
│   │       └── models/route.ts  # Returns installed Ollama models
│   ├── components/
│   │   ├── Sidebar.tsx          # Model selector + conversation history
│   │   ├── ChatArea.tsx         # Message list + input bar
│   │   └── MessageBubble.tsx    # Individual message with streaming cursor
│   └── types.ts                 # Shared TypeScript types
├── data/
│   └── documents/               # Drop PDFs/DOCX/TXT here for RAG (coming soon)
├── scripts/
│   └── ingest.py                # Indexes documents into the vector store (coming soon)
└── docker-compose.yml           # Future: multi-service orchestration
```

---

## Roadmap

- [x] Ollama install + model pull
- [x] Custom Next.js chat UI with streaming, conversation history, model selector
- [ ] RAG pipeline with ChromaDB
- [ ] Document ingestion script (PDF, DOCX, TXT)
- [ ] QLoRA fine-tuning script with Unsloth
- [ ] Evaluation notebook (compare models side by side)
- [ ] Docker-compose for full stack deployment
- [ ] Client deployment checklist

---

## License

MIT — see [LICENSE](LICENSE).
