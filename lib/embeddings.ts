import { Embeddings } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { AI_PROVIDER, OLLAMA_BASE_URL, OLLAMA_EMBEDDING_MODEL, HUGGINGFACE_API_KEY, HUGGINGFACE_EMBEDDING_MODEL, OPENAI_API_KEY } from "./config";

let embeddingsInstance: Embeddings;

function getEmbeddings(): Embeddings {
  if (embeddingsInstance) {
    return embeddingsInstance;
  }

  switch (AI_PROVIDER) {
    case "ollama":
      embeddingsInstance = new OllamaEmbeddings({
        model: OLLAMA_EMBEDDING_MODEL,
        baseUrl: OLLAMA_BASE_URL,
      });
      break;

    case "huggingface":
      if (!HUGGINGFACE_API_KEY) {
        throw new Error("HUGGINGFACE_API_KEY is required when using HuggingFace provider");
      }
      embeddingsInstance = new HuggingFaceInferenceEmbeddings({
        apiKey: HUGGINGFACE_API_KEY,
        model: HUGGINGFACE_EMBEDDING_MODEL,
      });
      break;

    case "openai":
      if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required when using OpenAI provider");
      }
      embeddingsInstance = new OpenAIEmbeddings({
        openAIApiKey: OPENAI_API_KEY,
        modelName: "text-embedding-3-small",
      });
      break;

    default:
      if (HUGGINGFACE_API_KEY) {
        console.warn(`Unknown provider ${AI_PROVIDER}, defaulting to HuggingFace`);
        embeddingsInstance = new HuggingFaceInferenceEmbeddings({
          apiKey: HUGGINGFACE_API_KEY,
          model: HUGGINGFACE_EMBEDDING_MODEL,
        });
      } else {
        throw new Error("HUGGINGFACE_API_KEY is required");
      }
  }

  return embeddingsInstance;
}

export const embeddings = getEmbeddings();

export function getEmbeddingDimensions(): number {
  switch (AI_PROVIDER) {
    case "ollama":
      return 768;
    case "huggingface":
      return 384;
    case "openai":
      return 1536;
    default:
      return 384;
  }
}
