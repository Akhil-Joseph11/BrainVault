# BrainVault - Serverless RAG SaaS Platform

A production-ready SaaS platform that allows users to upload PDF/Text documents and chat with them using semantic search and RAG (Retrieval-Augmented Generation).

## Features

- Document Upload: Drag-and-drop interface for uploading PDF and text files
- Vector Database Storage: Automatic chunking, embedding, and storage in Pinecone
- AI-Powered Chat: Ask questions about your documents with context-aware responses
- Real-time Streaming: Server-Sent Events for streaming AI responses
- Source Citations: See which document chunks were used to generate answers
- User Authentication: Secure authentication with Clerk
- Modern UI: Responsive design with dark mode support

## Tech Stack

- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes (Serverless)
- Vector Database: Pinecone
- AI/ML: LangChain with support for Ollama, HuggingFace Inference API, Groq, and OpenAI
- Authentication: Clerk
- Hosting: Vercel

## Prerequisites

Before you begin, you'll need:

1. **Node.js** 18+ installed
2. **Pinecone Account** (Free tier available): [https://www.pinecone.io/](https://www.pinecone.io/)
3. **AI Provider** (Choose ONE free option):
   - **Ollama** (100% free, recommended): [https://ollama.ai](https://ollama.ai) - Runs locally
   - **HuggingFace** (Free API): [https://huggingface.co](https://huggingface.co) - Get API key
   - **Groq** (Free tier, very fast): [https://console.groq.com](https://console.groq.com) - Get API key
   - **OpenAI** (Paid): [https://platform.openai.com](https://platform.openai.com) - Optional
4. **Clerk Account** (Free tier available): [https://clerk.com/](https://clerk.com/)
5. **Vercel Account** (Free tier available): [https://vercel.com/](https://vercel.com/) - Optional for local dev

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Set Up AI Provider

Choose one of the following options:

#### Option A: Ollama (Local)
1. Install Ollama: [https://ollama.ai](https://ollama.ai)
2. Pull the required models:
   ```bash
   ollama pull nomic-embed-text  # For embeddings (768 dimensions)
   ollama pull llama3.2:3b        # For chat (or use llama3.2:1b for smaller)
   ```
3. Verify Ollama is running: `ollama list`
4. Set `AI_PROVIDER=ollama` in your `.env.local`

#### Option B: HuggingFace Inference API
1. Sign up at [https://huggingface.co](https://huggingface.co)
2. Get API token: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Set in `.env.local`:
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=hf_...
   PINECONE_INDEX_DIMENSIONS=384
   ```

#### Option C: Groq
1. Sign up at [https://console.groq.com](https://console.groq.com)
2. Get API key from dashboard
3. Set in `.env.local`:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_...
   # Note: You'll still need Ollama or HuggingFace for embeddings
   ```

### 3. Set Up Pinecone

1. Sign up at [https://www.pinecone.io/](https://www.pinecone.io/)
2. Create a new index:
   - **Index Name**: `brainvault` (or any name you prefer)
   - **Dimensions**: 
     - `768` for Ollama (nomic-embed-text)
     - `384` for HuggingFace (all-MiniLM-L6-v2)
     - `1536` for OpenAI (text-embedding-3-small)
   - **Metric**: `cosine`
   - **Cloud Provider**: Choose AWS, GCP, or Azure
   - **Region**: Choose a region close to you

3. Copy your API key from the Pinecone dashboard

### 4. Set Up Clerk

1. Sign up at [https://clerk.com/](https://clerk.com/)
2. Create a new application
3. Configure authentication providers (Google, Email, etc.)
4. Copy your API keys from the Clerk dashboard

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory (copy from `env.example`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Pinecone Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=brainvault
PINECONE_INDEX_DIMENSIONS=768  # Match your embedding model

# AI Provider (choose one)
AI_PROVIDER=ollama  # or "huggingface", "groq", "openai"

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.2:3b

# HuggingFace (optional)
# HUGGINGFACE_API_KEY=hf_...

# Groq (optional)
# GROQ_API_KEY=gsk_...

# OpenAI (optional)
# OPENAI_API_KEY=sk-...
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Deploy to Vercel

For online hosting, use HuggingFace or Groq (API-based). Ollama requires local execution.

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub
3. Import your repository
4. Add environment variables (use `AI_PROVIDER=huggingface` for online hosting)
5. Deploy

For detailed deployment instructions, see [DEPLOY.md](./DEPLOY.md)

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

## 📁 Project Structure

```
brainvault/
├── app/
│   ├── api/
│   │   ├── chat/              # Chat API with streaming
│   │   └── documents/         # Document upload and management
│   ├── sign-in/               # Clerk sign-in page
│   ├── sign-up/               # Clerk sign-up page
│   ├── layout.tsx             # Root layout with Clerk
│   └── page.tsx               # Main dashboard
├── components/
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── FileUpload.tsx         # Drag-and-drop file upload
│   ├── DocumentList.tsx       # Document management UI
│   └── ChatInterface.tsx      # Chat UI with streaming
├── lib/
│   ├── pinecone.ts            # Pinecone client
│   ├── embeddings.ts          # OpenAI embeddings
│   ├── llm.ts                 # LangChain LLM setup
│   ├── document-processing.ts # PDF parsing and chunking
│   └── storage.ts             # In-memory document metadata storage
├── middleware.ts              # Clerk authentication middleware
└── package.json
```

## 🔍 How It Works

### Document Processing Pipeline

1. **Upload**: User uploads a PDF or text file
2. **Parsing**: File is parsed to extract text content
3. **Chunking**: Text is split into overlapping chunks (~1000 characters)
4. **Embedding**: Each chunk is converted to a vector embedding using OpenAI
5. **Storage**: Embeddings are stored in Pinecone with metadata
6. **Indexing**: Pinecone indexes vectors for fast similarity search

### Query Flow

1. **User Query**: User asks a question in the chat
2. **Embedding**: Query is converted to a vector embedding
3. **Search**: Similar vectors are retrieved from Pinecone (top 5 matches)
4. **Context Building**: Retrieved chunks are formatted as context
5. **LLM Generation**: GPT-4 generates a response based on context
6. **Streaming**: Response is streamed back to the user in real-time
7. **Source Citation**: Sources are displayed with the response

## 🎯 Key Features Explained

### Hybrid Search

The platform uses Pinecone's vector search for semantic similarity. While we don't implement full hybrid search (keyword + semantic) in this MVP, the semantic search provides excellent results by finding documents based on meaning rather than just keywords.

### Serverless Architecture

All API routes run as serverless functions on Vercel, automatically scaling with traffic without managing servers.

### Real-time Streaming

Using Server-Sent Events (SSE), AI responses stream to the user in real-time, providing a better user experience.

## 📝 Notes

### Storage

Document metadata is stored in-memory. For production use, replace `lib/storage.ts` with a database such as Supabase, MongoDB, or PostgreSQL.


## 🔒 Security

- All API routes are protected by Clerk authentication
- User data is isolated using Pinecone namespaces (per-user)
- Environment variables are securely managed in Vercel

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Pinecone, LangChain, and OpenAI

