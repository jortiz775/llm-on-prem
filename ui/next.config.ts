import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow the Next.js API routes to call Ollama running on localhost
  // even when the app is deployed behind a reverse proxy.
  async rewrites() {
    return []
  },
}

export default nextConfig
