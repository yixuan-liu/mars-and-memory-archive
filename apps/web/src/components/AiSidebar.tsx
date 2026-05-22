import { useState, useRef } from 'react'
import { Search, BookOpen, FileSearch, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'
import { api } from '../lib/utils'
import { MOCK_AI_REFERENCES } from '../lib/mockData'

interface Reference {
  id: string
  text: string
  chunkIndex: number
  metadata: Record<string, unknown>
  score: number
}

export function AiSidebar() {
  const [activeTab, setActiveTab] = useState<'qa' | 'sources'>('qa')
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [references, setReferences] = useState<Reference[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)

  const handleSearch = async () => {
    if (!query.trim() || isStreaming) return

    setAnswer('')
    setReferences([])
    setIsStreaming(true)

    try {
      const url = api.knowledge.queryUrl(query)
      const eventSource = new EventSource(url)
      abortRef.current = () => eventSource.close()

      eventSource.onmessage = (e) => {
        if (e.data === '[DONE]') {
          eventSource.close()
          setIsStreaming(false)
          return
        }
        try {
          const payload = JSON.parse(e.data)
          if (payload.type === 'chunk') {
            setAnswer((prev) => prev + payload.content)
          } else if (payload.type === 'references') {
            setReferences(payload.data)
            setActiveTab('sources')
          }
        } catch {
          // ignore parse errors
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        setIsStreaming(false)
        // Fallback to mock data for offline development
        if (!answer) {
          setAnswer(
            'M1 钢盔的前接缝（Front Seam）工艺主要出现在1941–1942年的早期批次中 [1]。这一批次由 McCord Radiator & Manufacturing Co. 主要承担生产，以两片钢材在盔体正前方拼合焊接为特征。\n\n自1943年起，随着战时生产规模的扩大，制造工艺逐步改进为后接缝（Rear Seam）设计 [2]。Schlueter 生产批次在接缝位置、内壁钢印标记等方面均有所区别，可结合合同编号加以精确断代。',
          )
          setReferences(MOCK_AI_REFERENCES)
          setActiveTab('sources')
        }
      }
    } catch {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  // Render answer with citation highlights [1], [2], etc.
  const renderAnswer = (text: string) => {
    const parts = text.split(/(\[\d+\])/g)
    return parts.map((part, i) => {
      if (/^\[\d+\]$/.test(part)) {
        const num = parseInt(part.slice(1, -1)) - 1
        return (
          <button
            key={i}
            onClick={() => setActiveTab('sources')}
            className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded bg-orange-900 text-orange-400 border border-orange-800 hover:bg-orange-800 transition-colors mx-0.5 align-middle"
          >
            {num + 1}
          </button>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <aside className="flex flex-col w-72 min-w-[18rem] h-full border-l border-border bg-surface-50">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-orange-400" />
          <p className="text-xs font-semibold text-white">AI 知识库</p>
        </div>
        <p className="text-[10px] text-zinc-600 mt-0.5">检索、引用与文件入库</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        {(['qa', 'sources'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 text-xs font-medium transition-colors',
              activeTab === tab
                ? 'text-white border-b-2 border-orange-500'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            {tab === 'qa' ? '问答' : '来源'}
          </button>
        ))}
      </div>

      {activeTab === 'qa' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Knowledge search */}
          <div className="px-3 py-3 border-b border-border flex-shrink-0">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              知识检索
            </p>
            <p className="text-[10px] text-zinc-600 mb-2">基于 Qdrant 语义向量检索</p>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="如：M1 钢盔如何断代？"
              className="w-full bg-surface-100 border border-border rounded-md px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-orange-700 transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={isStreaming || !query.trim()}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <><Loader2 size={12} className="animate-spin" />检索中...</>
              ) : (
                <><Search size={12} />检索</>
              )}
            </button>
          </div>

          {/* Answer */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {answer ? (
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  回答 · {references.length > 0 ? `${references.length} 条引用` : ''}
                </p>
                <div className={cn('text-xs text-zinc-300 leading-relaxed', isStreaming && 'streaming-cursor')}>
                  {renderAnswer(answer)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
                <FileSearch size={28} className="text-zinc-700" />
                <p className="text-xs text-zinc-600">输入问题，AI 将检索档案馆知识库并给出带引用的回答</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {references.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
              <FileSearch size={28} className="text-zinc-700" />
              <p className="text-xs text-zinc-600">完成一次问答后，引用来源将显示在此处</p>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                引用来源 · {references.length} 条
              </p>
              {references.map((ref, i) => (
                <ReferenceCard key={ref.id} ref_={ref} index={i + 1} />
              ))}
            </>
          )}
        </div>
      )}
    </aside>
  )
}

function ReferenceCard({ ref_, index }: { ref_: Reference; index: number }) {
  return (
    <div className="bg-surface-100 border border-border rounded-lg p-3 space-y-2 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="flex-shrink-0 w-5 h-5 rounded bg-orange-900 text-orange-400 border border-orange-800 text-[10px] font-bold flex items-center justify-center">
          {index}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] text-zinc-600">
            {Math.round(ref_.score * 100)}% 匹配
          </span>
          <ExternalLink size={10} className="text-zinc-600" />
        </div>
      </div>
      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-4">{ref_.text}</p>
      {ref_.metadata.documentTitle && (
        <p className="text-[10px] text-orange-600 truncate">
          📄 {ref_.metadata.documentTitle as string}
        </p>
      )}
    </div>
  )
}
