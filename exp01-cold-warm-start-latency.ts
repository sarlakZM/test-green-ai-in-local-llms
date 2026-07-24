
// This experiment measures the time required to load the model into RAM on the first request (Cold Start),
// compares it with subsequent requests (Warm Start), and also examines the model's behavior when using keep_alive: 0.
import axios from 'axios';
import { OLLAMA_API, TEST_MODEL } from './config';

async function sendRequest(keepAliveValue: string | number): Promise<number> {
  const startTime = Date.now();
  
  try {
    await axios.post(OLLAMA_API, {
      model: TEST_MODEL,
      prompt: "Why is the sky blue? Answer in one short sentence.",
      stream: false,
      keep_alive: keepAliveValue // Apply the memory retention parameter at the root level of the request
    });
  } catch (error) {
    console.error("API Error:", error);
  }
  
  return Date.now() - startTime;
}

async function runExperiment1() {
  console.log("=== Experiment 1: Measuring keep_alive & Cold Starts ===");
  
  // Step 1: Force the model to unload from memory
  console.log("Forcing model unload by sending keep_alive: 0...");
  await sendRequest(0); 
  console.log("Model unloaded. Waiting 2 seconds for system cleanup...");
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: First test (Cold Start - the model must be loaded from disk)
  console.log("Sending Request 1 (Cold Start)...");
  const t1 = await sendRequest("5m"); // Keep the model in RAM for 5 minutes
  console.log(`Cold Start Latency: ${t1}ms\n`);

  // Step 3: Second test (Warm Start - the model is already in RAM)
  console.log("Sending Request 2 (Warm Start)...");
  const t2 = await sendRequest("5m");
  console.log(`Warm Start Latency: ${t2}ms\n`);

  // Step 4: Unload again and observe the difference
  console.log("Re-unloading model (keep_alive: 0)...");
  const t3 = await sendRequest(0);
  console.log(`Unload Request Time (Response + Unload): ${t3}ms`);
  
  console.log(`\nAnalysis: Cold Start took ${((t1 - t2)/1000).toFixed(2)}s longer than Warm Start.`);
}

runExperiment1();

