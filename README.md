# BrainVault

A serverless RAG (Retrieval-Augmented Generation) platform that enables users to upload documents and interact with them through semantic search and AI-powered chat.

## Features

- Document upload with drag-and-drop interface for PDF and text files
- Vector database storage with automatic chunking and embedding
- AI-powered chat with context-aware responses
- Real-time streaming responses via Server-Sent Events
- Source citations showing document chunks used in responses
- User authentication with Clerk
- Responsive UI with dark theme

## Tech Stack

- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes (Serverless)
- Vector Database: Pinecone
- AI/ML: LangChain with support for Ollama, HuggingFace Inference API, Groq, and OpenAI
- Authentication: Clerk
- Hosting: Vercel

## Prerequisites

- Node.js 18 or higher
- Pinecone account: [https://www.pinecone.io/](https://www.pinecone.io/)
- AI Provider account (choose one):
  - Ollama: [https://ollama.ai](https://ollama.ai) - Local execution
  - HuggingFace: [https://huggingface.co](https://huggingface.co) - API-based
  - Groq: [https://console.groq.com](https://console.groq.com) - API-based
  - OpenAI: [https://platform.openai.com](https://platform.openai.com) - Paid option
- Clerk account: [https://clerk.com/](https://clerk.com/)
- Vercel account: [https://vercel.com/](https://vercel.com/) - For deployment

## Setup Instructions

### 1. Installation

```bash
npm install
```

### 2. Configure AI Provider

Choose one of the following options:

#### Option A: Ollama (Local)

1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Pull required models:
   ```bash
   ollama pull nomic-embed-text
   ollama pull llama3.2:3b
   ```
3. Verify installation: `ollama list`
4. Set `AI_PROVIDER=ollama` in `.env.local`

#### Option B: HuggingFace Inference API

1. Sign up at [https://huggingface.co](https://huggingface.co)
2. Generate API token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Configure `.env.local`:
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=hf_...
   PINECONE_INDEX_DIMENSIONS=384
   ```

#### Option C: Groq

1. Sign up at [https://console.groq.com](https://console.groq.com)
2. Generate API key from dashboard
3. Configure `.env.local`:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_...
   ```
   Note: Ollama or HuggingFace is still required for embeddings.

### 3. Configure Pinecone

1. Sign up at [https://www.pinecone.io/](https://www.pinecone.io/)
2. Create a new index with the following settings:
   - Index Name: `brainvault`
   - Dimensions: 768 (Ollama), 384 (HuggingFace), or 1536 (OpenAI)
   - Metric: cosine
   - Cloud Provider: AWS, GCP, or Azure
   - Region: Choose based on your location
3. Copy your API key from the dashboard

### 4. Configure Clerk

1. Sign up at [https://clerk.com/](https://clerk.com/)
2. Create a new application
3. Configure authentication providers
4. Copy your API keys from the dashboard

### 5. Environment Variables

Create a `.env.local` file in the root directory using `env.example` as a template:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Pinecone Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=brainvault
PINECONE_INDEX_DIMENSIONS=768

# AI Provider
AI_PROVIDER=ollama

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.2:3b

# HuggingFace Configuration (optional)
# HUGGINGFACE_API_KEY=hf_...

# Groq Configuration (optional)
# GROQ_API_KEY=gsk_...

# OpenAI Configuration (optional)
# OPENAI_API_KEY=sk-...
```

### 6. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Deployment

For serverless deployment, use HuggingFace or Groq (API-based providers). Ollama requires local execution and is not suitable for serverless platforms.

1. Push code to GitHub
2. Sign up at [vercel.com](https://vercel.com) with GitHub
3. Import your repository
4. Configure environment variables (use `AI_PROVIDER=huggingface` for deployment)
5. Deploy

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## Project Structure

```
brainvault/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   └── documents/
│   ├── sign-in/
│   ├── sign-up/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx
│   ├── FileUpload.tsx
│   ├── DocumentList.tsx
│   └── ChatInterface.tsx
├── lib/
│   ├── pinecone.ts
│   ├── embeddings.ts
│   ├── llm.ts
│   ├── document-processing.ts
│   └── storage.ts
├── middleware.ts
└── package.json
```

## Architecture

### Document Processing Pipeline

1. Upload: User uploads a PDF or text file
2. Parsing: File content is extracted
3. Chunking: Text is split into overlapping chunks (~1000 characters)
4. Embedding: Chunks are converted to vector embeddings
5. Storage: Embeddings are stored in Pinecone with metadata
6. Indexing: Vectors are indexed for similarity search

### Query Processing

1. User submits a query
2. Query is converted to a vector embedding
3. Similar vectors are retrieved from Pinecone (top 5 matches)
4. Retrieved chunks are formatted as context
5. LLM generates a response based on context
6. Response is streamed to the user via Server-Sent Events
7. Source citations are displayed with the response

### Serverless Architecture

API routes run as serverless functions on Vercel, automatically scaling with traffic. Document metadata is queried directly from Pinecone to ensure consistency across serverless instances.

## Security

- API routes are protected by Clerk authentication
- User data is isolated using Pinecone namespaces (per-user)
- Environment variables are managed securely in Vercel
- API keys are stored as environment variables

## License

This project is open source and available under the MIT License.
