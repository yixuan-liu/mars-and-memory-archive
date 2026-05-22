# Mars and Memory Archive 🚀

`Mars and Memory Archive` is a knowledge archive management system for militaria (historical military gear) identification and research, built on **RAG (Retrieval-Augmented Generation)** technology.

The system utilizes a rich-text editor (TipTap) as the authoritative storage format, extracts and chunks text, and leverages OpenAI and the Qdrant vector database to achieve high-precision semantic search, AI Q&A with source citations, and document deduplication.

---

## 🏗️ System Architecture & Data Flow

This system uses a decoupled architecture: **PostgreSQL** serves as the primary database storing the complete rich-text documents (TipTap JSON AST) and raw text chunks, while **Qdrant** serves purely as a high-speed semantic index storing vector points linked back to database records.

```mermaid
graph TD
    %% Client
    subgraph Frontend [React 19 Frontend - apps/web]
        Editor[TipTap Rich Text Editor]
        AIChat[AI Knowledge Search & Chat Panel]
    end

    %% Server
    subgraph Backend [NestJS Backend - apps/api]
        DocCtrl[Document Controller]
        KnowCtrl[Knowledge Controller]
        KnowServ[Knowledge Service]
    end

    %% Infrastructure
    subgraph Infrastructure [Infrastructure]
        PG[(PostgreSQL 16)]
        Qdrant[(Qdrant Vector DB)]
        OpenAI[OpenAI / Compatible API]
    end

    %% Data Flow
    Editor -->|1. Save Document| DocCtrl
    DocCtrl -->|Save JSON AST| PG
    
    Editor -->|2. Index Document| KnowCtrl
    KnowCtrl --> KnowServ
    KnowServ -->|Extract Text & Compute SHA-256 Checksum| KnowServ
    KnowServ -->|Deduplicate & Save Chunks| PG
    KnowServ -->|Get Embeddings| OpenAI
    KnowServ -->|Upsert Vector Points & Metadata| Qdrant
    
    AIChat -->|3. RAG Query| KnowCtrl
    KnowCtrl -->|SSE Stream| AIChat
    KnowServ -->|Vector Search| Qdrant
    Qdrant -->|Return Matching Point IDs| KnowServ
    KnowServ -->|Retrieve Chunks by ID| PG
    KnowServ -->|Prompt + Context| OpenAI
    OpenAI -->|Generate Cited Answer| KnowServ
```

---

## 🛠️ Technology Stack

### 1. Frontend (`apps/web`)
* **Core Framework**: React 19 + TypeScript + Vite 6
* **Styling & UI**: Tailwind CSS (v3) + Lucide React (Icons)
* **Editor**: TipTap Editor (uses JSON structure as the single source of truth for reliable parsing and precise paragraph chunking)
* **Communication**: SSE (Server-Sent Events) for streaming real-time chat responses with typewriter effects and inline citation payloads

### 2. Backend (`apps/api`)
* **Core Framework**: NestJS (v11)
* **ORM**: Prisma ORM
* **AI Orchestration**: LangChain (`@langchain/openai`, `@langchain/community`)
* **Core APIs**: 
  * Document CRUD management APIs
  * Knowledge indexing & deduplication API
  * SSE-based RAG query API

### 3. Shared Package (`packages/shared`)
* **Zod Schemas**: Shared DTO validation rules and interface contracts between frontend and backend
* **TipTap Utilities**: Document utilities including plain text extraction (`extractPlainText`), heading extraction, and a sliding-window text chunking algorithm (`chunkText`) tailored for RAG indexers.

### 4. Infrastructure
* **PostgreSQL 16**: Primary data store for documents, metadata, and raw text chunks
* **Qdrant**: High-performance vector database storing embeddings and performing cosine similarity search

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js** (>= 20)
* **pnpm** (>= 8)
* **Docker** & **Docker Compose**

### 2. Spin Up Infrastructure
Start PostgreSQL 16 and Qdrant instances using Docker Compose:
```bash
pnpm docker:up
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Modify `.env` to include your OpenAI API key (or any compatible endpoint like Doubao, Volcano Engine, DeepSeek, etc.):
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mars_memory_archive"

# Qdrant
QDRANT_URL="http://localhost:6333"
QDRANT_COLLECTION="militaria_chunks"

# AI - OpenAI Compatible API
OPENAI_API_KEY="sk-your-key-here"
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"
EMBEDDING_MODEL="text-embedding-3-small"

# API Server
API_PORT=3000
```

### 4. Initialize Database & Generate Prisma Client
Push database schema and generate Prisma client:
```bash
pnpm db:push
pnpm prisma:generate
```

### 5. Run in Development Mode
Start all services (frontend, backend, shared watch task) concurrently:
```bash
pnpm dev
```
Access endpoints at:
* **Frontend Application**: `http://localhost:5173`
* **Backend API**: `http://localhost:3000` (Swagger UI is available at `http://localhost:3000/api` if configured)

### 6. Build for Production
Build all workspaces:
```bash
pnpm build
```

---

## 💡 Core Workflows Explained

### 1. Document Ingestion & Deduplication
When a user triggers document indexing:
1. **Text Extraction**: The raw text is extracted recursively from the TipTap JSON tree structure using `extractPlainText`.
2. **Checksum Generation**: An SHA-256 hash is computed from the plain text.
3. **Deduplication Check**:
   * If a document source with the same checksum already exists, the old source, its database chunks, and corresponding Qdrant vector points are deleted first to prevent duplicate indexing and stale data.
4. **Chunking & Embedding**:
   * `chunkText` splits the document into overlapping chunks (default: 512 words, 64-word overlap).
   * Generates a 1536-dimension vector embedding for each chunk.
5. **Storage Binding**:
   * Saves raw text chunks to PostgreSQL.
   * Upserts embeddings and metadata to Qdrant under a generated unique `vectorPointId`.

### 2. RAG Q&A (Retrieval-Augmented Generation)
When a question is submitted to the AI Search:
1. **Query Vectorization**: Converts the user's question into a vector.
2. **Qdrant Vector Search**: Performs a cosine similarity search to retrieve the Top-K matching vector points.
3. **Database Chunks Retrieval**: Resolves the matched Qdrant Point IDs back into original raw text snippets from PostgreSQL.
4. **Context Prompting & Citations**:
   * Assembles the matching text snippets into a context-guided prompt for the LLM.
   * Directs the model to answer using inline citation tags like `[1]`, `[2]`, etc.
5. **SSE Response**: Streams the reply back to the React UI as Server-Sent Events, appending reference details at the end of the stream.
6. **UI Citations & Cards**: Renders the cited text dynamically alongside clickable tags that locate references in the sidebar.
