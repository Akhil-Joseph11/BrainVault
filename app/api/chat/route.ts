import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { index } from "@/lib/pinecone";
import { embeddings } from "@/lib/embeddings";
import { getNamespace } from "@/lib/document-processing";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SCOPE_IDS = 50;

function parseDocumentIds(body: {
  documentId?: unknown;
  documentIds?: unknown;
}): string[] | null {
  const raw: unknown[] = [];
  if (Array.isArray(body.documentIds)) {
    raw.push(...body.documentIds);
  }
  if (typeof body.documentId === "string" && body.documentId.trim()) {
    raw.push(body.documentId);
  }
  const ids = [
    ...new Set(
      raw
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => x.trim())
    ),
  ].slice(0, MAX_SCOPE_IDS);
  if (ids.length === 0) return null;
  return ids;
}

/** Scale retrieval when multiple documents are in scope so each can contribute chunks. */
function topKForScope(scopeCount: number | null): number {
  if (scopeCount === null) return 12;
  if (scopeCount === 1) return 8;
  return Math.min(40, Math.max(10, 6 * scopeCount));
}

const SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based on the provided document context.
- The context is grouped by document; each block is labeled with the document title and document_id. Keep track of which excerpts came from which document.
- Use the context to answer accurately; if information is missing, say so
- When you cite information, name the document (and chunk if helpful)
- Be concise but thorough
- Format your response clearly`;

function buildRetrievalContext(
  matches: Array<{ metadata?: Record<string, unknown> | null; score?: number }>
): string {
  type Group = {
    fileName: string;
    documentId: string;
    items: { chunkIndex: number; text: string }[];
  };
  const groups = new Map<string, Group>();

  for (const match of matches) {
    const m = (match.metadata ?? {}) as Record<string, unknown>;
    const fileName = String(m.fileName ?? "Unknown");
    const documentId =
      typeof m.documentId === "string" && m.documentId.length > 0
        ? m.documentId
        : fileName;
    const chunkIndex =
      typeof m.chunkIndex === "number" ? m.chunkIndex : Number(m.chunkIndex) || 0;
    const text = String(m.text ?? "");

    let g = groups.get(documentId);
    if (!g) {
      g = { fileName, documentId, items: [] };
      groups.set(documentId, g);
    }
    g.items.push({ chunkIndex, text });
  }

  for (const g of groups.values()) {
    g.items.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  const ordered = [...groups.values()].sort((a, b) =>
    a.fileName.localeCompare(b.fileName, undefined, { sensitivity: "base" })
  );

  const summary = `Retrieved excerpts from ${ordered.length} document(s): ${ordered
    .map((g) => `"${g.fileName}"`)
    .join(", ")}.\nBelow, each section belongs to exactly one document—use these labels when attributing facts.\n`;

  const sections = ordered.map((g, docOrdinal) => {
    const header = `--- Document ${docOrdinal + 1} / ${ordered.length}: "${g.fileName}" | document_id: ${g.documentId} ---`;
    const chunks = g.items
      .map(
        (item) =>
          `[Chunk index ${item.chunkIndex} | file: "${g.fileName}"]\n${item.text}`
      )
      .join("\n\n");
    return `${header}\n${chunks}`;
  });

  return `${summary}\n${sections.join("\n\n")}`;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { message } = body;
    const scopedDocumentIds = parseDocumentIds(body);

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const namespace = getNamespace(userId);
    const queryEmbedding = await embeddings.embedQuery(message);

    const filter =
      scopedDocumentIds === null
        ? undefined
        : scopedDocumentIds.length === 1
          ? { documentId: { $eq: scopedDocumentIds[0] } }
          : { documentId: { $in: scopedDocumentIds } };

    const topK = topKForScope(
      scopedDocumentIds === null ? null : scopedDocumentIds.length
    );

    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter,
    });
    if (queryResponse.matches.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No relevant documents found. Please upload documents first or try a different query.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const context = buildRetrievalContext(queryResponse.matches);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      [
        "human",
        "Context (grouped by document):\n{context}\n\nUser question: {question}",
      ],
    ]);

    let llmInstance;
    try {
      const { getLLMInstance } = await import("@/lib/llm");
      llmInstance = getLLMInstance();
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: error?.message || "Failed to initialize LLM. Please check your configuration.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Create chain with streaming
    const chain = RunnableSequence.from([
      prompt,
      llmInstance,
      new StringOutputParser(),
    ]);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await chain.stream({
            context,
            question: message,
          });

          for await (const chunk of responseStream) {
            const content = typeof chunk === 'string' ? chunk : (chunk as any).content || '';
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
          }

          const sources = queryResponse.matches.map((match) => {
            const md = match.metadata as Record<string, unknown>;
            return {
              documentId:
                typeof md.documentId === "string" ? md.documentId : undefined,
              fileName: md.fileName as string,
              chunkIndex: md.chunkIndex as number,
              score: match.score,
            };
          });

          const sourcesData = `data: ${JSON.stringify({ sources, done: true })}\n\n`;
          controller.enqueue(new TextEncoder().encode(sourcesData));
          controller.close();
        } catch (error) {
          console.error("Error in stream:", error);
          const errorData = `data: ${JSON.stringify({ error: "An error occurred" })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

