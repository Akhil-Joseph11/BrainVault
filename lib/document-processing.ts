import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export interface DocumentChunk {
  text: string;
  metadata: {
    documentId: string;
    userId: string;
    fileName: string;
    chunkIndex: number;
    createdAt: string;
  };
}

/**
 * Parse PDF file content
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse text file content
 */
export async function parseText(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}

/**
 * Chunk text into smaller pieces for embedding
 */
export async function chunkText(
  text: string,
  documentId: string,
  userId: string,
  fileName: string
): Promise<DocumentChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const chunks = await splitter.createDocuments([text]);

  return chunks.map((chunk, index) => ({
    text: chunk.pageContent,
    metadata: {
      documentId,
      userId,
      fileName,
      chunkIndex: index,
      createdAt: new Date().toISOString(),
    },
  }));
}

/**
 * Create namespace for Pinecone (per user)
 */
export function getNamespace(userId: string): string {
  return `user-${userId}`;
}

/**
 * Create vector ID for Pinecone
 */
export function createVectorId(documentId: string, chunkIndex: number): string {
  return `${documentId}-chunk-${chunkIndex}`;
}

