/**
 * Provider configuration
 * Set AI_PROVIDER to: "openai", "ollama", "huggingface", "groq", or "together"
 */
export type AIProvider = "openai" | "ollama" | "huggingface" | "groq" | "together";

export const AI_PROVIDER: AIProvider = (process.env.AI_PROVIDER || "huggingface") as AIProvider;

// Ollama configuration (for local models)
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";
export const OLLAMA_LLM_MODEL = process.env.OLLAMA_LLM_MODEL || "llama3.2:3b";

// HuggingFace configuration
export const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
export const HUGGINGFACE_EMBEDDING_MODEL = process.env.HUGGINGFACE_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2";
export const HUGGINGFACE_LLM_MODEL = process.env.HUGGINGFACE_LLM_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

// OpenAI (fallback, optional)
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Groq (free tier, very fast)
export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// Together.ai (OpenAI-compatible API: chat + embeddings)
// Docs: https://docs.together.ai/docs/openai-api-compatibility
export const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || "";
export const TOGETHER_BASE_URL =
  process.env.TOGETHER_BASE_URL || "https://api.together.xyz/v1";
/**
 * Embedding model id from Together's model list (see embeddings docs).
 * Default is the model used in Together's official examples; 1024-dim — matches default Pinecone setup.
 */
export const TOGETHER_EMBEDDING_MODEL =
  process.env.TOGETHER_EMBEDDING_MODEL || "intfloat/multilingual-e5-large-instruct";
/**
 * Chat/completions model id — must be a Together *serverless* model (see serverless-models docs).
 * Meta-Llama-3.1-8B-Instruct-Turbo requires a dedicated endpoint and will fail on serverless.
 */
export const TOGETHER_LLM_MODEL =
  process.env.TOGETHER_LLM_MODEL || "Qwen/Qwen2.5-7B-Instruct-Turbo";
/**
 * Vector size for the chosen Together embedding model (must match Pinecone index).
 * Default 1024 matches intfloat/multilingual-e5-large-instruct; set explicitly if you change TOGETHER_EMBEDDING_MODEL.
 */
export const TOGETHER_EMBEDDING_DIMENSIONS = process.env.TOGETHER_EMBEDDING_DIMENSIONS
  ? parseInt(process.env.TOGETHER_EMBEDDING_DIMENSIONS, 10)
  : 1024;

