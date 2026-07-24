import axios from 'axios';
import { execSync } from 'child_process';
import { OLLAMA_API, TEST_MODEL } from './config';

type Priority = 'Normal' | 'BelowNormal' | 'Idle';

type RunResult = {
  label: string;
  latencyMs: number;
  evalCount: number;
  evalDurationNs: number;
  tps: number;
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setOllamaPriority(priority: Priority) {
  try {
    const psCommand = `powershell -Command "Get-Process -Name 'ollama*' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = '${priority}' }"`;
    execSync(psCommand, { stdio: 'ignore' });
    console.log(`Successfully set Ollama process priority to: ${priority}`);
  } catch {
    console.warn('Could not set process priority. Run PowerShell as Administrator if needed.');
  }
}

async function runInferenceBenchmark(label: string): Promise<RunResult> {
  const prompt =
    'Explain quantum computing and its relation to green software engineering in exactly 350 words.';

  const startTime = Date.now();

  const response = await axios.post(OLLAMA_API, {
    model: TEST_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: 0,
      seed: 42,
      num_predict: 420,
      top_p: 1,
      top_k: 1,
    },
  });

  const latencyMs = Date.now() - startTime;
  const evalCount = response.data.eval_count ?? 0;
  const evalDurationNs = response.data.eval_duration ?? 0;

  const tps =
    evalDurationNs > 0 ? evalCount / (evalDurationNs / 1_000_000_000) : 0;

  console.log(
    `[${label}] Completed. Time: ${latencyMs}ms | Generated: ${evalCount} tokens | TPS: ${tps.toFixed(2)}`
  );

  return {
    label,
    latencyMs,
    evalCount,
    evalDurationNs,
    tps,
  };
}

function average(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

async function runScenario(priority: Priority, runs: number): Promise<RunResult[]> {
  setOllamaPriority(priority);
  const results: RunResult[] = [];

  for (let i = 0; i < runs; i++) {
    const label = `${priority} Run ${i + 1}`;
    const result = await runInferenceBenchmark(label);
    results.push(result);
    await sleep(3000);
  }

  return results;
}

function printScenarioSummary(name: string, results: RunResult[]) {
  const avgLatency = average(results.map(r => r.latencyMs));
  const avgTps = average(results.map(r => r.tps));
  const avgTokens = average(results.map(r => r.evalCount));

  console.log(`\n=== ${name} Summary ===`);
  console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`Average Tokens : ${avgTokens.toFixed(2)}`);
  console.log(`Average TPS    : ${avgTps.toFixed(2)}`);
}

async function runExperiment3() {
  console.log('=== Experiment 3: Resource Throttling & Priority ===');

  const runsPerScenario = 5;

  console.log('\n--- Scenario A: Normal Priority ---');
  const normalResults = await runScenario('Normal', runsPerScenario);

  console.log('\nWaiting 5 seconds before next scenario...');
  await sleep(5000);

  console.log('\n--- Scenario B: BelowNormal Priority (Green Mode) ---');
  const greenResults = await runScenario('BelowNormal', runsPerScenario);

  printScenarioSummary('Normal Priority', normalResults);
  printScenarioSummary('Green Mode', greenResults);

  const normalAvgTps = average(normalResults.map(r => r.tps));
  const greenAvgTps = average(greenResults.map(r => r.tps));

  const diffPct = ((normalAvgTps - greenAvgTps) / normalAvgTps) * 100;

  console.log('\n=== Comparative Analysis ===');
  console.log(`Normal Avg TPS: ${normalAvgTps.toFixed(2)}`);
  console.log(`Green Avg TPS : ${greenAvgTps.toFixed(2)}`);
  console.log(`Performance Delta (TPS reduction): ${diffPct.toFixed(2)}%`);
  console.log(
    "Note: 'BelowNormal' is mainly for host responsiveness and sustainable local execution, not guaranteed higher raw speed."
  );
}

runExperiment3().catch(err => {
  console.error('Experiment failed:', err.message);
});


// === Experiment 3: Resource Throttling & Priority ===

// --- Scenario A: Normal Priority ---
// Successfully set Ollama process priority to: Normal
// [Normal Run 1] Completed. Time: 44147ms | Generated: 420 tokens | TPS: 10.54
// [Normal Run 2] Completed. Time: 40765ms | Generated: 420 tokens | TPS: 10.49
// [Normal Run 3] Completed. Time: 41025ms | Generated: 420 tokens | TPS: 10.37
// [Normal Run 4] Completed. Time: 40441ms | Generated: 420 tokens | TPS: 10.52
// [Normal Run 5] Completed. Time: 40532ms | Generated: 420 tokens | TPS: 10.49

// Waiting 5 seconds before next scenario...

// --- Scenario B: BelowNormal Priority (Green Mode) ---
// Successfully set Ollama process priority to: BelowNormal
// [BelowNormal Run 1] Completed. Time: 40881ms | Generated: 420 tokens | TPS: 10.40
// [BelowNormal Run 2] Completed. Time: 40573ms | Generated: 420 tokens | TPS: 10.49
// [BelowNormal Run 3] Completed. Time: 40775ms | Generated: 420 tokens | TPS: 10.48
// [BelowNormal Run 4] Completed. Time: 40970ms | Generated: 420 tokens | TPS: 10.39
// [BelowNormal Run 5] Completed. Time: 40411ms | Generated: 420 tokens | TPS: 10.54

// === Normal Priority Summary ===
// Average Latency: 41382.00ms
// Average Tokens : 420.00
// Average TPS    : 10.48

// === Green Mode Summary ===
// Average Latency: 40722.00ms
// Average Tokens : 420.00
// Average TPS    : 10.46

// === Comparative Analysis ===
// Normal Avg TPS: 10.48
// Green Avg TPS : 10.46
// Performance Delta (TPS reduction): 0.23%
// Note: 'BelowNormal' is mainly for host responsiveness and sustainable local execution, not guaranteed higher raw speed.