// In this experiment, we send a long prompt (for example, repeated text to simulate a heavy context)
// to the model and vary the num_ctx parameter in the options to examine the model's truncation boundary
// and potential information loss.

import axios from 'axios';
import { OLLAMA_API, TEST_MODEL } from './config';

// Generate a large prompt with an approximate target length
function generateLargePrompt(approxWords: number): string {
  const baseText = "The quick brown fox jumps over the lazy dog. Green AI is sustainable software engineering. ";
  const repeated = baseText.repeat(Math.ceil(approxWords / 12));
  return `${repeated}\n\nTask: Based on the text above, what is 'Green AI'? Answer in 3 words.`;
}

async function testContextSize(numCtx: number, prompt: string) {
  const startTime = Date.now();
  try {
    const response = await axios.post(OLLAMA_API, {
      model: TEST_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        num_ctx: numCtx // Set num_ctx inside the options object
      }
    });
    const latency = Date.now() - startTime;
    console.log(`[num_ctx: ${numCtx}] Latency: ${latency}ms | Response: "${response.data.response.trim()}"`);
  } catch (error: any) {
    console.log(`[num_ctx: ${numCtx}] Failed. Error: ${error.message}`);
  }
}

async function runExperiment2() {
  console.log("=== Experiment 2: Context Window & Truncation ===");
  
  // Generate a text of about 3000 words (approximately 4000 tokens)
  const largePrompt = generateLargePrompt(3000);
  console.log(`Generated prompt length: ${largePrompt.length} characters.`);

  // Run the experiment under different configurations
  console.log("Running configurations...");
  
  // 1. Small context window (the beginning or end of the input is expected to overflow, leading to an invalid response)
  await testContextSize(512, largePrompt);
  
  // 2. Medium context window
  await testContextSize(2048, largePrompt);
  
  // 3. Large context window (sufficient for processing the full text)
  await testContextSize(8192, largePrompt);
}

runExperiment2();
