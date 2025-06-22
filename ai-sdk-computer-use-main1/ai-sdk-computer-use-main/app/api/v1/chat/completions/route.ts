import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";
import { killDesktop, getDesktopURL } from "@/lib/e2b/utils";
import { bashTool, computerTool } from "@/lib/e2b/tool";

// Allow streaming responses up to 30 seconds
export const maxDuration = 300;

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
}

// Convert OpenAI format messages to AI SDK format
function convertMessages(messages: OpenAIMessage[]) {
  return messages.map(msg => ({
    role: msg.role === "system" ? "user" : msg.role,
    content: msg.role === "system" ? `System: ${msg.content}` : msg.content
  }));
}

// Create streaming response in OpenAI format
function createStreamingResponse(result: any) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          const data = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: "claude-3-7-sonnet-20250219",
            choices: [{
              index: 0,
              delta: {
                content: chunk
              },
              finish_reason: null
            }]
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
        
        // Send final chunk
        const finalData = {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: "claude-3-7-sonnet-20250219",
          choices: [{
            index: 0,
            delta: {},
            finish_reason: "stop"
          }]
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body: OpenAIRequest = await req.json();
    const { messages, stream = false, model, ...otherParams } = body;

    // Create or get existing sandbox
    let sandboxId: string;
    try {
      const { id } = await getDesktopURL();
      sandboxId = id;
    } catch (error) {
      console.error("Failed to create sandbox:", error);
      return new Response(JSON.stringify({ 
        error: { 
          message: "Failed to initialize computer environment",
          type: "internal_error"
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const convertedMessages = convertMessages(messages);

    if (stream) {
      const result = streamText({
        model: anthropic("claude-3-7-sonnet-20250219"),
        messages: convertedMessages,
        tools: { computer: computerTool(sandboxId), bash: bashTool(sandboxId) },
        temperature: otherParams.temperature,
        maxTokens: otherParams.max_tokens,
        topP: otherParams.top_p,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      });

      return createStreamingResponse(result);
    } else {
      const result = await generateText({
        model: anthropic("claude-3-7-sonnet-20250219"),
        messages: convertedMessages,
        tools: { computer: computerTool(sandboxId), bash: bashTool(sandboxId) },
        temperature: otherParams.temperature,
        maxTokens: otherParams.max_tokens,
        topP: otherParams.top_p,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      });

      const response = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "claude-3-7-sonnet-20250219",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: result.text
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: result.usage?.promptTokens || 0,
          completion_tokens: result.usage?.completionTokens || 0,
          total_tokens: (result.usage?.promptTokens || 0) + (result.usage?.completionTokens || 0)
        }
      };

      return new Response(JSON.stringify(response), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    return new Response(JSON.stringify({ 
      error: { 
        message: "Internal server error",
        type: "internal_error"
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
