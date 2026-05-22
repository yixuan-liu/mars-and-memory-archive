import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { EditorToolbar } from './EditorToolbar'
import { ChevronRight, Save, Database, Pen, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import type { DocumentListItem } from '@mars-memory-archive/shared'

interface DocEditorProps {
  doc: DocumentListItem | null
  content: object
  isDirty: boolean
  onSave: () => void
  onIndex: () => void
  onContentChange: (json: object) => void
}

export function DocEditor({ doc, content, isDirty, onSave, onIndex, onContentChange }: DocEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 50 } }),
      Placeholder.configure({ placeholder: '开始撰写军品档案叙述...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getJSON())
    },
    editorProps: {
      attributes: { class: 'tiptap-editor min-h-[60vh] focus:outline-none px-1' },
    },
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="text-zinc-400">Mars & Memory</span>
          <ChevronRight size={12} />
          <span className="text-zinc-300 truncate max-w-xs">{doc?.title ?? '未命名文献'}</span>
        </div>

        {/* Status + actions */}
        <div className="flex items-center gap-2">
          {isDirty ? (
            <span className="flex items-center gap-1 text-[11px] text-amber-500">
              <Clock size={11} />
              存在未保存更改
            </span>
          ) : (
            <span className="text-[11px] text-zinc-600">已保存</span>
          )}

          {doc?.status === 'indexed' && (
            <Badge variant="indexed">已入库</Badge>
          )}

          <ActionButton onClick={() => {}} variant="ghost">续写</ActionButton>

          <ActionButton onClick={onIndex} variant="ghost">
            <Database size={12} />
            入库
          </ActionButton>

          <ActionButton onClick={onSave} variant="primary">
            <Save size={12} />
            保存
          </ActionButton>
        </div>
      </div>

      {/* Toolbar */}
      {editor && <EditorToolbar editor={editor} />}

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      {doc && (
        <div className="px-6 py-2 border-t border-border flex items-center gap-4 text-[11px] text-zinc-600 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(doc.updatedAt).toLocaleString('zh-CN')}
          </span>
          {doc.indexedAt && (
            <span className="flex items-center gap-1">
              <Database size={10} />
              入库于 {new Date(doc.indexedAt).toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ children, variant }: { children: React.ReactNode; variant: 'indexed' | 'draft' }) {
  return (
    <span
      className={cn(
        'text-[10px] px-1.5 py-0.5 rounded border font-medium',
        variant === 'indexed'
          ? 'bg-orange-950 text-orange-400 border-orange-900'
          : 'bg-zinc-900 text-zinc-500 border-zinc-700',
      )}
    >
      {children}
    </span>
  )
}

function ActionButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode
  onClick: () => void
  variant: 'ghost' | 'primary'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
        variant === 'primary'
          ? 'bg-accent text-white hover:bg-accent-light'
          : 'text-zinc-400 hover:text-white hover:bg-surface-100',
      )}
    >
      {children}
    </button>
  )
}
