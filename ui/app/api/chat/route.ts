// ============================================================
// app/api/chat/route.ts
// ============================================================
// Next.js Route Handler — POST /api/chat
//
// Acts as a thin proxy between the React frontend and Ollama.
// The frontend sends { model, messages } JSON.
// This handler forwards it to Ollama with stream: true and
// pipes the raw newline-delimited JSON stream straight back to
// the browser — giving the user that "typing" effect.
//
// Why proxy at all? So the Ollama port (11434) is never exposed
// directly to the browser — important for production deployments.
// ============================================================

import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // Parse the request body sent by the frontend.
  const { model, messages } = await req.json()

  let ollamaRes: Response
  try {
    // Forward the request to Ollama's chat completion endpoint.
    // stream: true makes Ollama respond with one JSON object per line
    // as it generates each token, instead of waiting for the full reply.
    ollamaRes = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
    })
  } catch {
    // Ollama process is not running at all.
    return new Response(
      JSON.stringify({ error: 'Cannot reach Ollama. Run `ollama serve` first.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (!ollamaRes.ok) {
    // Ollama returned an error (e.g. model not found).
    const body = await ollamaRes.text()
    return new Response(body, {
      status: ollamaRes.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Pipe the Ollama stream directly to the browser.
  // ReadableStream from fetch() is a web standard — Next.js supports it natively.
  return new Response(ollamaRes.body, {
    headers: {
      // text/plain works fine — the frontend parses each line as JSON.
      'Content-Type': 'text/plain; charset=utf-8',
      // Disable response buffering so tokens reach the browser immediately.
      'X-Accel-Buffering': 'no',
    },
  })
}
