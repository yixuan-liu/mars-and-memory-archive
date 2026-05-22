// Tiptap JSON node types
export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

export interface TiptapDocument {
  type: 'doc'
  content: TiptapNode[]
}

// Document status derived from indexedAt field
export type DocumentStatus = 'draft' | 'indexed'

export interface DocumentListItem {
  id: string
  title: string
  status: DocumentStatus
  indexedAt: string | null
  updatedAt: string
}
