import { Search, FileText, Archive, Sparkles, Plus, Settings, BookMarked } from 'lucide-react'
import { cn } from '../lib/utils'
import type { DocumentListItem } from '@mars-memory-archive/shared'

interface SidebarProps {
  documents: DocumentListItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

export function Sidebar({ documents, activeId, onSelect, onNew }: SidebarProps) {
  const indexed = documents.filter((d) => d.status === 'indexed')
  const drafts = documents.filter((d) => d.status === 'draft')

  return (
    <aside className="flex flex-col w-60 min-w-[15rem] h-full bg-surface-50 border-r border-border">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
          <BookMarked size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white leading-tight">Mars & Memory</p>
          <p className="text-[10px] text-muted leading-tight">Digital Militaria Archive</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 bg-surface-100 border border-border rounded-lg px-3 py-1.5">
          <Search size={13} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="检索文献..."
            className="bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 pb-2 space-y-0.5">
        <NavItem icon={<FileText size={14} />} label="全部文献" count={documents.length} active />
        <NavItem icon={<Archive size={14} />} label="已入库" count={indexed.length} />
        <NavItem icon={<Sparkles size={14} />} label="AI 补全" />
      </nav>

      <div className="mx-3 border-t border-border" />

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          文献档案
        </p>
        {documents.map((doc) => (
          <DocItem
            key={doc.id}
            doc={doc}
            isActive={doc.id === activeId}
            onClick={() => onSelect(doc.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3 space-y-1">
        <button
          onClick={onNew}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-surface-100 transition-colors"
        >
          <Plus size={13} />
          新建文献
        </button>
        <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-zinc-500 hover:text-white hover:bg-surface-100 transition-colors">
          <Settings size={13} />
          设置
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  count,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  count?: number
  active?: boolean
}) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors',
        active
          ? 'bg-surface-200 text-white'
          : 'text-zinc-400 hover:text-white hover:bg-surface-100',
      )}
    >
      <span className={active ? 'text-orange-400' : 'text-zinc-500'}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] bg-surface-200 text-zinc-500 px-1.5 py-0.5 rounded">
          {count}
        </span>
      )}
    </button>
  )
}

function DocItem({
  doc,
  isActive,
  onClick,
}: {
  doc: DocumentListItem
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-2 w-full px-2 py-2 rounded-md text-left transition-colors group',
        isActive ? 'bg-surface-200' : 'hover:bg-surface-100',
      )}
    >
      <FileText size={13} className="mt-0.5 flex-shrink-0 text-zinc-500 group-hover:text-zinc-400" />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-xs truncate leading-snug',
            isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200',
          )}
        >
          {doc.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {doc.status === 'indexed' ? (
            <span className="text-[9px] bg-orange-950 text-orange-400 border border-orange-900 px-1 py-0.5 rounded font-medium">
              RAG
            </span>
          ) : (
            <span className="text-[9px] text-zinc-600">草稿</span>
          )}
        </div>
      </div>
    </button>
  )
}
