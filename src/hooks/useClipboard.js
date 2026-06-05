import { useState } from 'react'

export function useClipboard() {
  const [copied, setCopied] = useState(false)

  async function copy(text) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return { copied, copy }
}
