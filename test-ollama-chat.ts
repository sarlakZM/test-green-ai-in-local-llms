const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'qwen2.5:1.5b';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaChatResponse {
  model: string;
  message: ChatMessage;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

async function chatWithOllama(): Promise<void> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages: [
        {
          role: 'system',
          content: `
            You are an Angular 22 architecture assistant.
            Generate concise, production-oriented TypeScript code.
            Prefer standalone components, signals, and OnPush.
          `,
        },
        {
          role: 'user',
          content: `
            Create an Angular standalone component that displays
            the energy consumption of an AI inference request.
          `,
        },
      ],
      options: {
        temperature: 0.2,
        num_predict: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}: ${await response.text()}`,
    );
  }

  const result = (await response.json()) as OllamaChatResponse;

  console.log(result.message.content);
}

chatWithOllama().catch(console.error);
