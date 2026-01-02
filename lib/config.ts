/**
 * Provider configuration
 * Set AI_PROVIDER to: "openai", "ollama", "huggingface", or "groq"
 */
export type AIProvider = "openai" | "ollama" | "huggingface" | "groq";

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

