const OLLAMA_URL_ = 'http://localhost:11434';
const MODEL_ = 'qwen2.5:1.5b';

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

async function testOllama(): Promise<void> {
  console.log(`Testing Ollama model: ${MODEL_}`);

  const response = await fetch(`${OLLAMA_URL_}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_,
      prompt: `
        Create a minimal Angular standalone component
        using signals and OnPush change detection.
      `,
      stream: false,
      keep_alive: 0, // Immediately unload the model from RAM after the response
      options: {
        num_thread: 2, // Use at most 2 compute threads to avoid occupying all CPU cores
        num_ctx: 1024, // Limit the context buffer length for faster computation
        // Limit the context window size to reduce RAM usage
        // num_ctx: 2048, 
        // Limit the maximum number of generated output tokens to avoid long CPU-intensive computation
        num_predict: 256, 
        // Reduce model creativity to reach a deterministic answer faster and lower computational effort
        temperature: 0.1, 
        // Disable features that may consume additional resources when possible
        low_vram: true 
      }
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}\n${errorBody}`,
    );
  }

  const result = (await response.json()) as OllamaGenerateResponse;

  console.log('\n--- Model response ---\n');
  console.log(result.response);

  console.log('\n--- Metadata ---');
  console.log({
    model: result.model,
    done: result.done,
    promptTokens: result.prompt_eval_count,
    generatedTokens: result.eval_count,
    totalDurationMs: result.total_duration
      ? result.total_duration / 1_000_000
      : undefined,
  });
}

testOllama().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }

  process.exitCode = 1;
});
