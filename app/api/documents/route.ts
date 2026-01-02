import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDocuments, deleteDocument as removeDocument, getDocument } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { index } = await import("@/lib/pinecone");
    const { getNamespace } = await import("@/lib/document-processing");
    const { getEmbeddingDimensions } = await import("@/lib/embeddings");
    
    const namespace = getNamespace(userId);
    const dimensions = getEmbeddingDimensions();
    const dummyVector = new Array(dimensions).fill(0);

    // Query Pinecone to get all unique documents by querying vectors and extracting metadata
    // This works on serverless because Pinecone data persists, unlike in-memory storage
    const queryResponse = await index.namespace(namespace).query({
      vector: dummyVector,
      topK: 10000,
      includeMetadata: true,
    });

    // Extract unique documents from the vector metadata
    const documentMap = new Map<string, {
      id: string;
      fileName: string;
      fileType: string;
      uploadDate: string;
      chunkCount: number;
    }>();

    queryResponse.matches.forEach((match) => {
      const metadata = match.metadata as any;
      if (metadata.documentId && metadata.fileName) {
        if (!documentMap.has(metadata.documentId)) {
          documentMap.set(metadata.documentId, {
            id: metadata.documentId,
            fileName: metadata.fileName,
            fileType: metadata.fileType || "unknown",
            uploadDate: metadata.createdAt || new Date().toISOString(),
            chunkCount: 0,
          });
        }
        const doc = documentMap.get(metadata.documentId)!;
        doc.chunkCount = Math.max(doc.chunkCount, (metadata.chunkIndex || 0) + 1);
      }
    });

    const documents = Array.from(documentMap.values());
    
    // Sort by upload date (newest first)
    documents.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const { index } = await import("@/lib/pinecone");
    const { getNamespace, createVectorId } = await import("@/lib/document-processing");

    const namespace = getNamespace(userId);
    const document = getDocument(userId, documentId);

    try {
      let vectorIds: string[] = [];

      if (document && document.chunkCount) {
        vectorIds = Array.from({ length: document.chunkCount }, (_, i) =>
          createVectorId(documentId, i)
        );
      } else {
        const { getEmbeddingDimensions } = await import("@/lib/embeddings");
        const dimensions = getEmbeddingDimensions();
        const dummyVector = new Array(dimensions).fill(0);

        const queryResponse = await index.namespace(namespace).query({
          vector: dummyVector,
          topK: 10000,
          includeMetadata: true,
          filter: {
            documentId: { $eq: documentId },
          },
        });

        vectorIds = queryResponse.matches.map((match) => match.id);
      }

      if (vectorIds.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < vectorIds.length; i += batchSize) {
          const batch = vectorIds.slice(i, i + batchSize);
          await index.namespace(namespace).deleteMany(batch);
        }
      }
    } catch (pineconeError: any) {
      console.error("Error deleting from Pinecone:", pineconeError);
    }

    removeDocument(userId, documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

