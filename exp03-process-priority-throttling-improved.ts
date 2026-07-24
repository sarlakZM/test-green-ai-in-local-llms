import axios from 'axios';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { OLLAMA_API, TEST_MODEL } from './config';

// Type definitions used to improve code readability and structural clarity
type Priority = 'Normal' | 'BelowNormal';

interface ResourceMetrics {
  cpuPercent: number;
  workingSetMB: number;
}

interface RunResult {
  runIndex: number;
  priority: Priority;
  latencyMs: number;
  evalCount: number;
  evalDurationNs: number;
  tps: number;
  avgCpu: number;
  maxRamMB: number;
}

// Helper function to introduce a delay between runs and allow CPU cooldown
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sets the priority class of the Ollama process in Windows using PowerShell
 */
function setOllamaPriority(priority: Priority) {
  try {
    const psCommand = `powershell -Command "Get-Process -Name 'ollama*' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = '${priority}' }"`;
    execSync(psCommand, { stdio: 'ignore' });
    console.log(`[OS OS-Level] Ollama process priority set to: ${priority}`);
  } catch (err) {
    console.warn(`[Warning] Could not set priority to ${priority}. Run terminal as Administrator.`);
  }
}

/**
 * Collects real-time hardware usage statistics for Ollama-related processes via PowerShell
 */
// function getOllamaResourceUsage(): ResourceMetrics {
//   try {
//     // Uses 'ollama*' to detect all related processes, including ollama_llama_server
//     // const psCommand = `powershell -Command "Get-Process -Name 'ollama*' -ErrorAction SilentlyContinue | Select-Object -Property Name, CPU, WorkingSet | ConvertTo-Json"`;
//     const psCommand =
//       `powershell -Command "@(Get-Process | Where-Object { $_.Name -match 'ollama|llama' } ` +
//       `| Select-Object Name, CPU, WorkingSet) | ConvertTo-Json -Depth 3"`;

//     const output = execSync(psCommand).toString().trim();

//     if (!output) return { cpuPercent: 0, workingSetMB: 0 };

//     const data = JSON.parse(output);

//     if (Array.isArray(data)) {
//       // Sums the RAM usage (WorkingSet) across all active Ollama-related processes
//       const totalRam = data.reduce((acc, curr) => acc + (curr.WorkingSet || 0), 0);
//       // For CPU, this computes the total or average processor time consumed by the processes
//       const totalCpu = data.reduce((acc, curr) => acc + (curr.CPU || 0), 0);

//       return {
//         cpuPercent: Math.round(totalCpu),
//         workingSetMB: Math.round(totalRam / (1024 * 1024)) // Convert bytes to megabytes
//       };
//     } else {
//       return {
//         cpuPercent: Math.round(data.CPU || 0),
//         workingSetMB: Math.round((data.WorkingSet || 0) / (1024 * 1024))
//       };
//     }
//   } catch {
//     return { cpuPercent: 0, workingSetMB: 0 };
//   }
// }

function getOllamaResourceUsage(): ResourceMetrics {
  try {
    const psCommand =
      `powershell -Command "` +
      `$cpuCount = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors; ` +
      `$procs = @(Get-CimInstance Win32_PerfFormattedData_PerfProc_Process ` +
      `| Where-Object { $_.Name -match 'ollama|llama' } ` +
      `| Select-Object Name, PercentProcessorTime, WorkingSetPrivate); ` +
      `$result = [PSCustomObject]@{ CpuCount = $cpuCount; Processes = $procs }; ` +
      `$result | ConvertTo-Json -Depth 4"`;

    const output = execSync(psCommand).toString().trim();

    if (!output) {
      return { cpuPercent: 0, workingSetMB: 0 };
    }

    const parsed = JSON.parse(output);
    const cpuCount = Number(parsed.CpuCount || 1);
    const processes = Array.isArray(parsed.Processes)
      ? parsed.Processes
      : parsed.Processes
        ? [parsed.Processes]
        : [];

    if (processes.length === 0) {
      return { cpuPercent: 0, workingSetMB: 0 };
    }

    const totalRamBytes = processes.reduce(
      (acc: any, curr: any) => acc + Number(curr.WorkingSetPrivate || 0),
      0
    );

    const totalCpuRaw = processes.reduce(
      (acc: any , curr: any) => acc + Number(curr.PercentProcessorTime || 0),
      0
    );

    const normalizedCpu = totalCpuRaw / cpuCount;

    return {
      cpuPercent: Math.round(normalizedCpu),
      workingSetMB: Math.round(totalRamBytes / (1024 * 1024))
    };
  } catch {
    return { cpuPercent: 0, workingSetMB: 0 };
  }
}

/**
 * Executes one repeatable inference request while monitoring system resources in parallel
 */
async function runInferenceWithMonitoring(priority: Priority, runIndex: number): Promise<RunResult> {
  const prompt = "Explain quantum computing and its relation to green software engineering in exactly 350 words.";
  
  // Arrays used to store sampled hardware monitoring values during inference
  const cpuSamples: number[] = [];
  const ramSamples: number[] = [];
  
  // Starts a resource sampling timer that records metrics every 500 milliseconds
  const monitorInterval = setInterval(() => {
    const stats = getOllamaResourceUsage();
    if (stats.cpuPercent > 0) cpuSamples.push(stats.cpuPercent);
    if (stats.workingSetMB > 0) ramSamples.push(stats.workingSetMB);
  }, 500);

  const startTime = Date.now();
  let responseData: any;

  try {
    const response = await axios.post(OLLAMA_API, {
      model: TEST_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0, // Removes output randomness for scientific consistency
        seed: 42,       // Uses a fixed seed to encourage reproducible token generation
        num_predict: 420, // Constrains the output window size
        top_p: 1.0,
        top_k: 1
      }
    });
    responseData = response.data;
  } finally {
    // Stops resource monitoring after the full model response is received
    clearInterval(monitorInterval);
  }

  const latencyMs = Date.now() - startTime;
  const evalCount = responseData.eval_count ?? 0;
  const evalDurationNs = responseData.eval_duration ?? 1; // Prevents division by zero
  
  // Calculates tokens per second (TPS) using the model-reported evaluation duration
  const tps = evalCount / (evalDurationNs / 1_000_000_000);

  // Computes summary statistics from the captured hardware samples
  const avgCpu = cpuSamples.length > 0 ? (cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length) : 0;
  const maxRam = ramSamples.length > 0 ? Math.max(...ramSamples) : 0;

  console.log(`[Run ${runIndex}] Time: ${latencyMs}ms | TPS: ${tps.toFixed(2)} | Avg CPU: ${avgCpu.toFixed(1)}% | Max RAM: ${maxRam}MB`);

  return {
    runIndex,
    priority,
    latencyMs,
    evalCount,
    evalDurationNs,
    tps,
    avgCpu,
    maxRamMB: maxRam
  };
}

/**
 * Performs statistical analysis on benchmark data by calculating mean and standard deviation
 */
function calculateStats(results: RunResult[]) {
  const n = results.length;
  const tpsList = results.map(r => r.tps);
  const latencyList = results.map(r => r.latencyMs);
  const cpuList = results.map(r => r.avgCpu);
  const ramList = results.map(r => r.maxRamMB);

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / n;
  
  const stdDev = (arr: number[], avg: number) => {
    const sqDiffs = arr.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / n);
  };

  const avgTps = mean(tpsList);
  const avgLatency = mean(latencyList);
  const avgCpu = mean(cpuList);
  const avgRam = mean(ramList);

  return {
    avgTps,
    stdDevTps: stdDev(tpsList, avgTps),
    avgLatency,
    stdDevLatency: stdDev(latencyList, avgLatency),
    avgCpu,
    avgRam
  };
}

/**
 * Saves the collected benchmark results into a standard CSV file
 */
function saveResultsToCSV(results: RunResult[]) {
  const filePath = path.join(__dirname, 'experiment3_results.csv');
  const headers = 'RunIndex,Priority,LatencyMs,EvalCount,EvalDurationNs,TPS,AvgCpuPercent,MaxRamMB\n';
  const rows = results.map(r => 
    `${r.runIndex},${r.priority},${r.latencyMs},${r.evalCount},${r.evalDurationNs},${r.tps.toFixed(4)},${r.avgCpu.toFixed(2)},${r.maxRamMB}`
  ).join('\n');

  fs.writeFileSync(filePath, headers + rows, 'utf-8');
  console.log(`\n[Export] Detailed benchmark results saved to: ${filePath}`);
}

/**
 * Prints an academic-style comparison table suitable for thesis reporting
 */
function printThesisTable(normalStats: any, greenStats: any, deltaTps: number, deltaLatency: number) {
  console.log('\n' + '='.repeat(80));
  console.log('                 ACADEMIC COMPARISON TABLE (FOR THESIS PROPOSAL)         ');
  console.log('='.repeat(80));
  console.log(
    `| Metric                  | Normal Priority (Default) | BelowNormal (Green Mode) | Delta (%) |`
  );
  console.log('-'.repeat(80));
  console.log(
    `| Throughput (TPS)        | ${normalStats.avgTps.toFixed(2)} ± ${normalStats.stdDevTps.toFixed(2)}      | ${greenStats.avgTps.toFixed(2)} ± ${greenStats.stdDevTps.toFixed(2)}      | ${deltaTps.toFixed(2)}%    |`
  );
  console.log(
    `| Request Latency (ms)    | ${normalStats.avgLatency.toFixed(0)} ± ${normalStats.stdDevLatency.toFixed(0)}       | ${greenStats.avgLatency.toFixed(0)} ± ${greenStats.stdDevLatency.toFixed(0)}       | ${deltaLatency.toFixed(2)}%    |`
  );
  console.log(
    `| Avg CPU Usage (%)       | ${normalStats.avgCpu.toFixed(1)}%                    | ${greenStats.avgCpu.toFixed(1)}%                    | ${(greenStats.avgCpu - normalStats.avgCpu).toFixed(1)}% (Diff)|`
  );
  console.log(
    `| Max Process memory (MB) | ${normalStats.avgRam.toFixed(0)} MB                 | ${greenStats.avgRam.toFixed(0)} MB                 | ${(greenStats.avgRam - normalStats.avgRam).toFixed(0)} MB (Diff)|`
  );
  console.log('='.repeat(80));
  console.log('Note: Values formatted as Mean ± Standard Deviation over 5 sample runs.');
  console.log('='.repeat(80) + '\n');
}

/**
 * Main orchestration function for the full benchmark workflow
 */
async function run() {
  console.log('===========================================================');
  console.log('STARTING EXPERIMENT 3: RESOURCE THROTTLING & GREEN BENCHMARK');
  console.log('===========================================================');

  const runsPerScenario = 5;
  const allResults: RunResult[] = [];

  // Scenario A: default process priority and normal system behavior
  console.log('\n--- Activating Scenario A: Normal Priority ---');
  setOllamaPriority('Normal');
  await sleep(2000); // Allows time for CPU and process state stabilization

  for (let i = 1; i <= runsPerScenario; i++) {
    const res = await runInferenceWithMonitoring('Normal', i);
    allResults.push(res);
    await sleep(4000); // Introduces a cooldown period for thermal and clock stability
  }

  console.log('\nWaiting 8 seconds before switching scenarios to clear hardware states...');
  await sleep(8000);

  // Scenario B: applies green resource management using BelowNormal priority
  console.log('\n--- Activating Scenario B: BelowNormal Priority (Green Mode) ---');
  setOllamaPriority('BelowNormal');
  await sleep(2000);

  for (let i = 1; i <= runsPerScenario; i++) {
    const res = await runInferenceWithMonitoring('BelowNormal', i);
    allResults.push(res);
    await sleep(4000);
  }

  // Performs statistical calculations on the collected results
  const normalRuns = allResults.filter(r => r.priority === 'Normal');
  const greenRuns = allResults.filter(r => r.priority === 'BelowNormal');

  const normalStats = calculateStats(normalRuns);
  const greenStats = calculateStats(greenRuns);

  // Computes relative percentage differences between scenarios
  const deltaTps = ((greenStats.avgTps - normalStats.avgTps) / normalStats.avgTps) * 100;
  const deltaLatency = ((greenStats.avgLatency - normalStats.avgLatency) / normalStats.avgLatency) * 100;

  // Final output stage
  saveResultsToCSV(allResults);
  printThesisTable(normalStats, greenStats, deltaTps, deltaLatency);
}

run().catch(err => console.error('Critical Failure during benchmark run:', err));
