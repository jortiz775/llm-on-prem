# LLM On-Prem

A private sandbox for running, testing, and deploying local large language models (LLMs) without sending data to any external service.

Built on top of [Ollama](https://ollama.com) with a focus on:

- **Privacy** — everything runs on your own hardware, nothing leaves the machine
- **RAG** (Retrieval-Augmented Generation) — chat with your own documents
- **Fine-tuning** — adapt open-source models to a specific domain using QLoRA
- **Client deployability** — structured so it can be replicated in a company environment

---

## Stack

| Layer | Tool |
|---|---|
| Model runner | [Ollama](https://ollama.com) |
| Chat UI | [Open WebUI](https://github.com/open-webui/open-webui) |
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

> Tested on: AMD Ryzen 7 7700X, 32 GB RAM, NVIDIA RTX 4070 Ti (12 GB VRAM)

---

## Getting Started

### 1. Install Ollama

Download and install from [ollama.com](https://ollama.com), then pull a model:

```powershell
# Good all-rounder (8B, ~5 GB)
ollama pull llama3

# Fast and accurate (7B, ~4 GB)
ollama pull mistral

# Small but impressive (3.8B, ~2 GB)
ollama pull phi3
```

### 2. Start the Chat UI

```powershell
docker compose up -d
```

Open `http://localhost:3000` — you'll see a ChatGPT-like interface connected to your local Ollama instance.

### 3. Add Your Documents (RAG)

Drop files into `data/documents/` and run the ingestion script:

```powershell
python scripts/ingest.py
```

The model will now answer questions using your documents as context.

---

## Project Structure

```
llm-on-prem/
├── docker-compose.yml       # Spins up Ollama + Open WebUI
├── data/
│   └── documents/           # Drop your PDFs, Word docs, text files here
├── scripts/
│   └── ingest.py            # Indexes documents into the vector store
├── rag/
│   └── pipeline.py          # RAG query pipeline
├── finetuning/
│   └── train.py             # QLoRA fine-tuning with Unsloth
└── notebooks/
    └── experiments.ipynb    # Quick experiments and model comparisons
```

---

## Roadmap

- [ ] Ollama + Open WebUI docker-compose baseline
- [ ] RAG pipeline with ChromaDB
- [ ] Document ingestion script (PDF, DOCX, TXT)
- [ ] QLoRA fine-tuning script with Unsloth
- [ ] Evaluation notebook (compare models side by side)
- [ ] Client deployment checklist

---

## License

MIT — see [LICENSE](LICENSE).
