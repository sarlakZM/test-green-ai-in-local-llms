import axios from 'axios';
import { execSync } from 'child_process';
import { OLLAMA_API, TEST_MODEL } from './config';

// Changes the process priority using PowerShell
function setOllamaPriority(priority: 'Normal' | 'BelowNormal' | 'Idle') {
  try {
    const psCommand = `powershell -Command "Get-Process -Name 'ollama*' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = '${priority}' }"`;
    execSync(psCommand);
    console.log(`Successfully set Ollama process priority to: ${priority}`);
  } catch (err) {
    console.warn("Could not set process priority. Run as Administrator if needed.");
  }
}

async function runInferenceBenchmark(label: string): Promise<{ latency: number, tps: number }> {
  const startTime = Date.now();
  const prompt = "Explain quantum computing and its relation to green software engineering in 300 words.";
  
  const response = await axios.post(OLLAMA_API, {
    model: TEST_MODEL,
    prompt: prompt,
    stream: false
  });
  
  const latencyMs = Date.now() - startTime;
  const evalCount = response.data.eval_count || 0; // Number of generated tokens
  const tps = evalCount > 0 ? (evalCount / (latencyMs / 1000)) : 0;
  
  console.log(`[${label}] Completed. Time: ${latencyMs}ms | Generated: ${evalCount} tokens | TPS: ${tps.toFixed(2)}`);
  return { latency: latencyMs, tps };
}

async function runExperiment3() {
  console.log("=== Experiment 3: Resource Throttling & Priority ===");

  // First test: normal priority (default Windows scheduling behavior)
  console.log("\n--- Scenario A: Normal Priority ---");
  setOllamaPriority('Normal');
  const normalResults = await runInferenceBenchmark("Normal Priority");

  // Simulates a short CPU cooldown interval between scenarios (sustainable practice)
  console.log("Waiting 3 seconds for CPU cooling...");
  await new Promise(r => setTimeout(r, 3000));

  // Second test: applies lower priority (BelowNormal) to reduce resource pressure and keep the system responsive
  console.log("\n--- Scenario B: BelowNormal Priority (Green Mode) ---");
  setOllamaPriority('BelowNormal');
  const greenResults = await runInferenceBenchmark("Green Mode");

  console.log("\n=== Comparative Analysis ===");
  console.log(`Normal TPS: ${normalResults.tps.toFixed(2)} | Green TPS: ${greenResults.tps.toFixed(2)}`);
  const diffPct = ((normalResults.tps - greenResults.tps) / normalResults.tps) * 100;
  console.log(`Performance Delta (TPS reduction): ${diffPct.toFixed(2)}%`);
  console.log("Note: Running under 'BelowNormal' keeps the host system highly responsive during long training/inference jobs.");
}

runExperiment3();


