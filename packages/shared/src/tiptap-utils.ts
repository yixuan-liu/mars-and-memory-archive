import type { TiptapDocument, TiptapNode } from './types'

/**
 * Extract all plain text content from a Tiptap JSON document.
 * Used for generating checksums and chunking text for RAG indexing.
 */
export function extractPlainText(doc: TiptapDocument): string {
  const parts: string[] = []

  function traverse(node: TiptapNode) {
    if (node.type === 'text' && node.text) {
      parts.push(node.text)
    }
    if (node.content) {
      node.content.forEach(traverse)
      // Add paragraph breaks between block elements
      if (['paragraph', 'heading', 'blockquote', 'listItem'].includes(node.type)) {
        parts.push('\n')
      }
    }
  }

  doc.content.forEach(traverse)
  return parts.join('').trim()
}

/**
 * Extract all headings from a Tiptap document for metadata and TOC.
 */
export function extractHeadings(doc: TiptapDocument): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = []

  function traverse(node: TiptapNode) {
    if (node.type === 'heading' && node.attrs?.level) {
      const text = node.content?.map((n) => n.text ?? '').join('') ?? ''
      headings.push({ level: node.attrs.level as number, text })
    }
    if (node.content) {
      node.content.forEach(traverse)
    }
  }

  doc.content.forEach(traverse)
  return headings
}

/**
 * Split a plain text string into overlapping chunks for vector embedding.
 * Uses a simple sliding window approach suitable for militaria archive documents.
 */
export function chunkText(
  text: string,
  chunkSize = 512,
  overlap = 64,
): Array<{ text: string; index: number }> {
  const chunks: Array<{ text: string; index: number }> = []
  const words = text.split(/\s+/)
  let start = 0
  let index = 0

  while (start < words.length) {
    const chunk = words.slice(start, start + chunkSize).join(' ')
    if (chunk.trim()) {
      chunks.push({ text: chunk.trim(), index })
      index++
    }
    start += chunkSize - overlap
  }

  return chunks
}

/**
 * Create an empty Tiptap document (used for new documents).
 */
export function createEmptyDocument(): TiptapDocument {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  }
}
