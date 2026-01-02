import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { parsePDF, parseText, chunkText, getNamespace, createVectorId } = await import("@/lib/document-processing");
    const { embeddings } = await import("@/lib/embeddings");
    const { index } = await import("@/lib/pinecone");
    const { addDocument } = await import("@/lib/storage");
    const { v4: uuidv4 } = await import("uuid");

    const fileType = file.type;
    const fileName = file.name;
    const isPDF = fileType === "application/pdf" || fileName.endsWith(".pdf");
    const isText = fileType.startsWith("text/") || fileName.endsWith(".txt");

    if (!isPDF && !isText) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF or text files." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = isPDF ? await parsePDF(buffer) : await parseText(buffer);
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "File appears to be empty or could not be parsed" },
        { status: 400 }
      );
    }

    const documentId = uuidv4();
    const namespace = getNamespace(userId);
    const chunks = await chunkText(text, documentId, userId, fileName);
    const vectors = await Promise.all(
      chunks.map(async (chunk, chunkIndex) => {
        const embedding = await embeddings.embedQuery(chunk.text);
        return {
          id: createVectorId(documentId, chunkIndex),
          values: embedding,
          metadata: {
            ...chunk.metadata,
            text: chunk.text.substring(0, 1000),
          },
        };
      })
    );

    const batchSize = 100;
    try {
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.namespace(namespace).upsert(batch);
      }
    } catch (pineconeError: any) {
      if (pineconeError.message?.includes('404') || pineconeError.message?.includes('not found')) {
        throw new Error(
          `Pinecone index "${process.env.PINECONE_INDEX_NAME}" not found. ` +
          `Please create it at https://app.pinecone.io/ with ${process.env.PINECONE_INDEX_DIMENSIONS || 384} dimensions.`
        );
      }
      throw pineconeError;
    }

    addDocument({
      id: documentId,
      userId,
      fileName,
      fileType,
      uploadDate: new Date().toISOString(),
      chunkCount: chunks.length,
    });

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        fileName,
        chunkCount: chunks.length,
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload document";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
