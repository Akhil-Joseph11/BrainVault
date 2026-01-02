import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddingDimensions } from "./embeddings";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("PINECONE_INDEX_NAME is not set");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

export function getPineconeDimensions(): number {
  return process.env.PINECONE_INDEX_DIMENSIONS 
    ? parseInt(process.env.PINECONE_INDEX_DIMENSIONS) 
    : getEmbeddingDimensions();
}

