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

const SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based on the provided document context. 
- Use the context provided to answer the user's question accurately
- If the context doesn't contain enough information to answer the question, say so
- Cite the source documents when referencing specific information
- Be concise but thorough in your responses
- Format your response in a clear, readable manner`;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message, documentId } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const namespace = getNamespace(userId);
    const queryEmbedding = await embeddings.embedQuery(message);

    const filter = documentId
      ? { documentId: { $eq: documentId } }
      : undefined;

    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: 5,
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

    const context = queryResponse.matches
      .map((match) => {
        const metadata = match.metadata as any;
        return `[Source: ${metadata.fileName}, Chunk ${metadata.chunkIndex}]\n${metadata.text}`;
      })
      .join("\n\n");

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      ["human", "Context from documents:\n{context}\n\nUser question: {question}"],
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

          const sources = queryResponse.matches.map((match) => ({
            fileName: (match.metadata as any).fileName,
            chunkIndex: (match.metadata as any).chunkIndex,
            score: match.score,
          }));

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

