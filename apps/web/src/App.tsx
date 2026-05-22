import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { DocEditor } from './components/DocEditor'
import { AiSidebar } from './components/AiSidebar'
import { MOCK_DOCUMENTS, MOCK_ACTIVE_CONTENT } from './lib/mockData'
import type { DocumentListItem } from '@mars-memory-archive/shared'

export default function App() {
  const [documents] = useState<DocumentListItem[]>(MOCK_DOCUMENTS)
  const [activeId, setActiveId] = useState<string>(MOCK_DOCUMENTS[0].id)
  const [content, setContent] = useState<object>(MOCK_ACTIVE_CONTENT)
  const [isDirty, setIsDirty] = useState(false)

  const activeDoc = documents.find((d) => d.id === activeId) ?? null

  const handleSelectDoc = (id: string) => {
    setActiveId(id)
    setIsDirty(false)
    // In production: fetch doc content from API
    setContent(MOCK_ACTIVE_CONTENT)
  }

  const handleNewDoc = () => {
    console.log('Create new document')
    // In production: POST /documents, then select new doc
  }

  const handleSave = () => {
    // In production: PUT /documents/:id with content
    console.log('Save document', { id: activeId, content })
    setIsDirty(false)
  }

  const handleIndex = () => {
    // In production: POST /knowledge/index/:id
    console.log('Index document into RAG', { id: activeId })
  }

  const handleContentChange = (json: object) => {
    setContent(json)
    setIsDirty(true)
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        documents={documents}
        activeId={activeId}
        onSelect={handleSelectDoc}
        onNew={handleNewDoc}
      />
      <main className="flex-1 overflow-hidden">
        <DocEditor
          doc={activeDoc}
          content={content}
          isDirty={isDirty}
          onSave={handleSave}
          onIndex={handleIndex}
          onContentChange={handleContentChange}
        />
      </main>
      <AiSidebar />
    </div>
  )
}
