import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { AI_PROVIDER, OLLAMA_BASE_URL, OLLAMA_LLM_MODEL, HUGGINGFACE_API_KEY, HUGGINGFACE_LLM_MODEL, OPENAI_API_KEY, GROQ_API_KEY } from "./config";

let llmInstance: BaseChatModel;

function getLLM(): BaseChatModel {
  if (llmInstance) {
    return llmInstance;
  }

  switch (AI_PROVIDER) {
    case "ollama":
      llmInstance = new ChatOllama({
        model: OLLAMA_LLM_MODEL,
        baseUrl: OLLAMA_BASE_URL,
        temperature: 0.7,
      });
      break;

    case "huggingface":
      if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is required when using HuggingFace provider for chat");
      }
      llmInstance = new ChatOpenAI({
        modelName: "llama-3.1-8b-instant",
        openAIApiKey: GROQ_API_KEY,
        temperature: 0.7,
        streaming: true,
        configuration: {
          baseURL: "https://api.groq.com/openai/v1",
        },
      } as any);
      break;

    case "groq":
      if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is required when using Groq provider");
      }
      llmInstance = new ChatOpenAI({
        modelName: "llama-3.1-8b-instant",
        openAIApiKey: GROQ_API_KEY,
        temperature: 0.7,
        streaming: true,
        configuration: {
          baseURL: "https://api.groq.com/openai/v1",
        },
      } as any);
      break;

    case "openai":
      if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required when using OpenAI provider");
      }
      llmInstance = new ChatOpenAI({
        openAIApiKey: OPENAI_API_KEY,
        modelName: "gpt-4o-mini",
        temperature: 0.7,
        streaming: true,
      });
      break;

    default:
      console.warn(`Unknown provider ${AI_PROVIDER}, defaulting to Ollama`);
      llmInstance = new ChatOllama({
        model: OLLAMA_LLM_MODEL,
        baseUrl: OLLAMA_BASE_URL,
        temperature: 0.7,
      });
  }

  return llmInstance;
}

let llmInstanceCache: BaseChatModel | null = null;

export function getLLMInstance(): BaseChatModel {
  if (!llmInstanceCache) {
    llmInstanceCache = getLLM();
  }
  return llmInstanceCache;
}

export const llm = {
  get instance() {
    return getLLMInstance();
  }
} as any;
