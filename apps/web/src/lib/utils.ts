import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = 'http://localhost:3000'

export const api = {
  documents: {
    list: () => fetch(`${API_BASE}/documents`).then((r) => r.json()),
    get: (id: string) => fetch(`${API_BASE}/documents/${id}`).then((r) => r.json()),
    create: (data: { title: string }) =>
      fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    update: (id: string, data: { title?: string; contentJson?: object }) =>
      fetch(`${API_BASE}/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  },
  knowledge: {
    index: (documentId: string) =>
      fetch(`${API_BASE}/knowledge/index/${documentId}`, { method: 'POST' }).then((r) => r.json()),
    queryUrl: (q: string, topK = 5) =>
      `${API_BASE}/knowledge/query?q=${encodeURIComponent(q)}&topK=${topK}`,
  },
}
