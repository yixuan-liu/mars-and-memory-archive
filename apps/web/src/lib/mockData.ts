import type { DocumentListItem } from '@mars-memory-archive/shared'

export const MOCK_DOCUMENTS: DocumentListItem[] = [
  {
    id: 'doc-1',
    title: '二战美军 M1 钢盔识别规范与出厂批次特征',
    status: 'indexed',
    indexedAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T18:31:00Z',
  },
  {
    id: 'doc-2',
    title: '1942年美军陆军制服与徽章标识指南',
    status: 'indexed',
    indexedAt: '2026-05-18T09:00:00Z',
    updatedAt: '2026-05-18T14:00:00Z',
  },
  {
    id: 'doc-3',
    title: '英国皇家空军战斗机飞行员夹克特征断代',
    status: 'draft',
    indexedAt: null,
    updatedAt: '2026-05-21T11:00:00Z',
  },
  {
    id: 'doc-4',
    title: '德军 M42 钢盔印记与制造厂代码名录',
    status: 'indexed',
    indexedAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-05-15T16:00:00Z',
  },
  {
    id: 'doc-5',
    title: '苏联 SSh-40 头盔特征与生产厂分析',
    status: 'draft',
    indexedAt: null,
    updatedAt: '2026-05-22T09:00:00Z',
  },
]

export const MOCK_ACTIVE_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: '二战美军 M1 钢盔识别规范与出厂批次特征' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'M1 钢盔是美国陆军在二战期间（1941–1945年）最具代表性的防护装备之一。其生产由多家制造商承担，包括 McCord Radiator & Manufacturing Co.、Schlueter Manufacturing Co. 以及 International Harvester 等，不同批次的制造特征是鉴定与断代的核心依据。',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '接缝特征（Seam Characteristics）' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '早期批次（1941–1942年）的 M1 钢盔以"前接缝"（Front Seam）为主要特征：接缝位于盔体正面，由两片钢材在前方拼合焊接。这一工艺在战时生产压力下于1943年前后逐步被"后接缝"（Rear Seam）工艺取代，接缝移至盔体后部，材料利用率更高，也成为中后期批次的主要标志。',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '钢印与批次编码' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '钢盔内壁通常印有制造商代码与批次编号。McCord 生产的钢盔标注有"M" 或完整的 "McCord" 字样及四位数字的合同编号。Schlueter 批次则常见"S" 前缀配合数字。熟悉这些编码体系，是进行精确断代的必备基础技能。',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '注：前后接缝的工艺差异并非绝对的时间分水岭，部分制造商在过渡期内同时生产两种版本，鉴定时需结合钢印与内衬吊带等综合特征进行判断。',
            },
          ],
        },
      ],
    },
  ],
}

export const MOCK_AI_REFERENCES = [
  {
    id: 'ref-1',
    text: 'McCord 生产的早期批次 M1 钢盔（1941–1942年）采用前接缝工艺，合同编号多为 W-W-1-ORD-3090 系列，接缝位置在盔体正前方约 2–3 厘米处，焊接宽度约 5mm。',
    chunkIndex: 0,
    metadata: { documentTitle: 'M1 钢盔识别规范', documentId: 'doc-1' },
    score: 0.94,
  },
  {
    id: 'ref-2',
    text: 'Schlueter 制造的 M1 钢盔通常标记有 "S" 前缀批次代码，后期批次（1943年后）均采用后接缝设计，可通过盔体内壁的圆形焊接痕迹加以区分。',
    chunkIndex: 1,
    metadata: { documentTitle: 'M1 钢盔识别规范', documentId: 'doc-1' },
    score: 0.88,
  },
]
