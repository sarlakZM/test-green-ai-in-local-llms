# Local-First Green AI - README Documentation

This document provides detailed documentation, structural breakdowns, and
 resource-optimization guidelines for the core utility scripts used in verifying,
 managing, and interacting with the local Ollama inference engine.

 Green Computing & Resource Optimization
 When running LLMs locally on developer workstations, resource footprint management is critical. Every execution detail—from thread limits ( num_thread ) to context windows ( num_ctx ) and memory unloading
 ( keep_alive )—directly impacts: 
 1. CPU Usage: Prevents processor saturation, preserving system responsiveness. 
 2. RAM Footprint: Avoids swapping to disk, which degrades performance and increases power
 consumption. 
 3. Inference Latency & Energy Draw: Reduces overall instruction execution time, leading to lower energy footprint.


### Installation

For detailed instructions on how to install Ollama on your system, please refer to the **[Installation Guide](docs/installation.md)**. This guide covers prerequisites, download links, and step-by-step setup for various operating systems.

### Ollama Commands and Configuration

Once Ollama is installed, you'll need to know how to interact with it. The **[Ollama Commands and Configuration](docs/ollama-setup-and-commands.md)** document provides a comprehensive reference for:

*   Core CLI commands
*   Local API endpoints
*   Monitoring and status checks
*   Model management
*   Environment variable settings
*   Troubleshooting common errors
    
### Test Run Analysis

For a detailed breakdown of all test results, including performance tables (TPS, Latency, CPU, RAM), strategic recommendations for developers, and insights into "Green AI" potential, please refer to the **[Analysis of Test Runs](docs/analysis-of-test-runs-en.md)** document.

---

## Table of Contents

- [Local-First Green AI - README Documentation](#local-first-green-ai---readme-documentation)
    - [Installation](#installation)
    - [Ollama Commands and Configuration](#ollama-commands-and-configuration)
    - [Test Run Analysis](#test-run-analysis)
  - [Table of Contents](#table-of-contents)
  - [1. Academic Profile \& Research Scope](#1-academic-profile--research-scope)
  - [2. File 1: `test-ollama.ts` - Low-Resource Generation Sanity Test](#2-file-1-test-ollamats---low-resource-generation-sanity-test)
    - [Purpose \& Experimental Role](#purpose--experimental-role)
    - [Green Computing \& Resource Optimization](#green-computing--resource-optimization)
    - [Research Relevance](#research-relevance)
    - [Technical Implementation Details](#technical-implementation-details)
  - [3. File 2: `chat-ollama.ts` - Instruction-Guided Chat API Profiling](#3-file-2-chat-ollamats---instruction-guided-chat-api-profiling)
    - [Purpose \& Experimental Role](#purpose--experimental-role-1)
    - [Green Computing \& Resource Optimization](#green-computing--resource-optimization-1)
    - [Research Relevance](#research-relevance-1)
  - [4. File 3: `list-models.ts` - Model Footprint \& Memory Inspection](#4-file-3-list-modelsts---model-footprint--memory-inspection)
    - [Purpose \& Experimental Role](#purpose--experimental-role-2)
    - [Green Computing \& Resource Optimization](#green-computing--resource-optimization-2)
    - [Research Relevance](#research-relevance-2)
  - [5. File 4: `exp01-cold-warm-start-latency.ts` - Cold Start vs. Warm Start \& `keep_alive` Retention](#5-file-4-exp01-cold-warm-start-latencyts---cold-start-vs-warm-start--keep_alive-retention)
    - [Purpose \& Experimental Role](#purpose--experimental-role-3)
    - [Green Computing \& Resource Optimization](#green-computing--resource-optimization-3)
    - [Research Relevance](#research-relevance-3)
  - [6. File 5: `exp02-context-window-memory-latency.ts` - Context Window (`num_ctx`), Truncation \& Memory Latency](#6-file-5-exp02-context-window-memory-latencyts---context-window-num_ctx-truncation--memory-latency)
    - [Purpose \& Experimental Role](#purpose--experimental-role-4)
    - [Green Computing \& Resource Optimization](#green-computing--resource-optimization-4)
    - [Research Relevance](#research-relevance-4)
  - [7. Green Computing Guidelines \& Best Practices](#7-green-computing-guidelines--best-practices)
  - [8. File 6: `exp03-process-priority-throttling.ts` - Process Priority Throttling, Green Mode, and Resource-Aware Scheduling](#8-file-6-exp03-process-priority-throttlingts---process-priority-throttling-green-mode-and-resource-aware-scheduling)
    - [Purpose \& Experimental Role](#purpose--experimental-role-5)
    - [Version A: `exp03-process-priority-throttling.ts` - Baseline Priority Comparison](#version-a-exp03-process-priority-throttlingts---baseline-priority-comparison)
    - [Version B: `exp03-process-priority-throttling-repeated.ts` - Repeated Deterministic Benchmarking](#version-b-exp03-process-priority-throttling-repeatedts---repeated-deterministic-benchmarking)
    - [Version C: `exp03-process-priority-throttling.improved.ts` - Resource Profiling and Academic Reporting](#version-c-exp03-process-priority-throttlingimprovedts---resource-profiling-and-academic-reporting)
    - [Green Computing \& Resource Optimization](#green-computing--resource-optimization-5)
    - [Research Relevance](#research-relevance-5)

---

## 1. Academic Profile & Research Scope

Currently researching Green AI and Sustainable Software Engineering, focusing on methodologies to profile, analyze, and minimize the computational and energy footprints of local LLMs and intelligent agent architectures at the edge-cloud continuum.

---

## 2. File 1: `test-ollama.ts` - Low-Resource Generation Sanity Test

### Purpose & Experimental Role

`test-ollama.ts` acts as a baseline diagnostic benchmark for low-resource inference. It establishes a baseline verification mechanism for local model connectivity, verifying that small-footprint models such as `qwen2.5:1.5b` can operate effectively within tight computational constraints.

### Green Computing & Resource Optimization

From a Green AI perspective, raw compute time is directly proportional to energy usage (`E = P x t`). By constraining `num_thread` and capping `num_predict`, this script minimizes total CPU cycles spent per inference pass. Setting `keep_alive: 0` ensures the host returns to its baseline idle state immediately after execution instead of keeping the model resident in RAM or VRAM.

### Research Relevance

This script implements resource-constrained inference. It forces the system to immediately unload weights via keep_alive: 0 , acting as a reference configuration for "Green Mode" scheduling to minimize idle energy consumption.


### Technical Implementation Details
 • Time Conversion: Converts execution time from nanoseconds to milliseconds:
 Duration (ns)  Duration (ms)=Duration (ns)1,000,000 \text{Duration (ms)} = \frac{\text{Duration (ns)}}{1,000,000} 
Duration (ms) = 1,000,000

 • Error Propagation: Monitors HTTP response status and sets a non-zero exit code on failure for automated pipelines.

---

## 3. File 2: `chat-ollama.ts` - Instruction-Guided Chat API Profiling

### Purpose & Experimental Role

`chat-ollama.ts` tests role-based instruction following through Ollama's `/api/chat` interface. It isolates the system prompt from user input, verifying whether lightweight LLMs can preserve architectural fidelity without requiring large prompt contexts.

### Green Computing & Resource Optimization

System prompts act as persistent context buffers. By keeping the system prompt concise, the model spends fewer FLOPS evaluating prompt KV-cache attention matrices with quadratic scaling. Asking the model to produce concise, production-oriented code also suppresses unnecessarily verbose output, reducing total decoding time and energy use per request.

### Research Relevance

This script simulates the behavior of a local-first coding assistant. In sustainable software engineering, local AI assistants should produce precise, compilable artifacts in single-shot prompts, because repeated prompt refinement increases computational overhead and cumulative energy cost. Since energy cost is correlated with total context length and token generation, encouraging efficiency
 at the prompt level directly reduces the total compute cycle:

 ```Energy Cost ∝ Context Length × Tokens Generated```


---
## 4. File 3: `list-models.ts` - Model Footprint & Memory Inspection

### Purpose & Experimental Role

`list-models.ts` acts as an inventory and memory profiling utility. It inspects locally stored LLM weights via Ollama's `/api/tags` endpoint and reports model sizes in gigabytes to evaluate hardware feasibility before inference execution.

### Green Computing & Resource Optimization

Model size directly influences RAM and VRAM bandwidth usage during inference. Smaller models are more likely to fit within available cache or VRAM, reducing swapping and memory pressure. By monitoring model footprint before execution, the system can select the smallest viable model for a task, which is a direct Green AI optimization strategy.

### Research Relevance

In edge-cloud infrastructure, static disk footprint and dynamic memory residency are key operational constraints. This script provides the inventory layer needed to correlate model footprint with cold-start behavior and deployment feasibility on constrained hardware.

---

## 5. File 4: `exp01-cold-warm-start-latency.ts` - Cold Start vs. Warm Start & `keep_alive` Retention

### Purpose & Experimental Role

`exp01-cold-warm-start-latency.ts` quantifies cold-start latency versus warm-start execution. It measures the overhead incurred when model weights must be read from disk into active RAM or VRAM, compared with requests sent to an already loaded model.

### Green Computing & Resource Optimization

This experiment captures a classic trade-off in local inference systems. Cold starts incur high I/O and memory-loading costs, while warm starts reduce latency by reusing resident weights. However, keeping models alive in memory consumes standby resources. For bursty workloads, short retention intervals often provide a more sustainable compromise between responsiveness and memory occupation.

### Research Relevance

This script is highly relevant to adaptive scheduling in sustainable AI systems. By quantifying the time difference between cold and warm execution, it supports policies that decide when model retention is worth the resource cost and when unloading is the greener choice.

---

## 6. File 5: `exp02-context-window-memory-latency.ts` - Context Window (`num_ctx`), Truncation & Memory Latency

### Purpose & Experimental Role

`exp02-context-window-memory-latency.ts` investigates how context window size (`num_ctx`) affects prompt ingestion latency, memory allocation, and output quality. It tests the model with prompts that can exceed the configured context window to observe truncation behavior.

### Green Computing & Resource Optimization

Attention complexity scales approximately with the square of context length. Allocating an unnecessarily large `num_ctx` inflates KV-cache memory usage and increases prompt processing overhead. Matching context size to realistic workload needs is therefore an important optimization for both performance and energy efficiency.

### Research Relevance

This experiment provides direct evidence for the trade-off between context retention and computational cost. It is useful for designing local AI systems that must balance retrieval quality, latency, and memory pressure under real-world resource limits.

---

## 7. Green Computing Guidelines & Best Practices

| Parameter | Recommended Value | Green AI Rationale |

| `keep_alive` | `0` or `30s` | Purges VRAM or RAM immediately after execution to return the system to baseline idle power. |

| `num_thread` | `2` or `4` | Prevents CPU core saturation and helps maintain thermal stability. |

| `num_ctx` | `1024` - `2048` | Reduces KV-cache allocation and accelerates attention processing. |

| `temperature` | `0.1` - `0.2` | Reduces output variance and lowers decoding overhead. |

| `num_predict` | `256` - `500` | Caps response length and limits energy use per request. |

---

## 8. File 6: `exp03-process-priority-throttling.ts` - Process Priority Throttling, Green Mode, and Resource-Aware Scheduling

### Purpose & Experimental Role

The `experiment3-resource-throttling` series investigates whether reducing Ollama's operating-system process priority from `Normal` to `BelowNormal` can serve as a practical Green Mode scheduling policy for local LLM inference. The central research question is not whether lower priority makes inference faster, but whether it preserves acceptable throughput while reducing contention with foreground developer workloads and improving host responsiveness.

This experiment family is especially relevant in local-first AI environments where inference must coexist with IDEs, browsers, test runners, build systems, and monitoring agents on commodity hardware. In such systems, sustainable AI is not only about minimizing raw energy consumption, but also about reducing resource monopolization, limiting thermal pressure, and maintaining predictable quality of service for concurrent workloads.

### Version A: `exp03-process-priority-throttling.ts` - Baseline Priority Comparison

This first file is the simplest prototype of the experiment. It performs a direct comparison between two scenarios:

1. Ollama running with `Normal` priority

2. Ollama running with `BelowNormal` priority

The script changes process priority through PowerShell, sends a single inference request, measures total request latency using wall-clock timing, extracts the generated token count from `eval_count`, and computes tokens-per-second from end-to-end elapsed time. Its prompt asks the model to generate approximately 300 words on quantum computing and green software engineering.

Methodologically, this version is useful as a proof-of-concept because it demonstrates the full control loop: scheduler intervention, inference execution, timing capture, and comparative reporting. However, it has important limitations for research-quality benchmarking. It runs each scenario only once, does not control randomness with deterministic inference parameters, and does not directly capture CPU or RAM usage. As a result, it is suitable for initial observation but not for statistically defensible conclusions.

### Version B: `exp03-process-priority-throttling-repeated.ts` - Repeated Deterministic Benchmarking

The second file strengthens the experimental design by introducing repeated runs and deterministic generation settings. It executes both `Normal` and `BelowNormal` scenarios five times each, with cooldown delays between runs and between scenarios. It also fixes generation behavior using `temperature: 0`, `seed: 42`, `top_p: 1`, `top_k: 1`, and `num_predict: 420`, while requesting exactly 350 words.

This version improves rigor in two important ways. First, repeated execution reduces the influence of transient operating-system noise and one-off timing anomalies. Second, throughput is no longer estimated from total request time alone; instead, it is computed using Ollama's reported `eval_duration`, which better isolates decoding speed from surrounding request overhead.

The recorded sample output in the file shows that the average TPS difference between `Normal` and `BelowNormal` is very small, with only about a 0.23% reduction in throughput. This is an important finding: a lower process priority may preserve nearly the same decoding performance while making the host machine more cooperative for concurrent user activity. In Green AI terms, this supports the idea that scheduling policy can improve system-level sustainability without materially harming inference utility.

### Version C: `exp03-process-priority-throttling.improved.ts` - Resource Profiling and Academic Reporting

The third file is the most complete and research-ready implementation. It extends the repeated-priority experiment by adding live hardware resource monitoring during inference. In addition to latency, generated tokens, and TPS, it tracks CPU utilization and private RAM consumption of Ollama-related processes using PowerShell and `Win32_PerfFormattedData_PerfProc_Process`. Sampling is performed every 500 milliseconds while inference is active.

This version transforms the experiment from a simple performance comparison into a resource-aware scheduling study. CPU usage is normalized by logical processor count, allowing reported values to be interpreted as a 0-100% system-equivalent utilization metric. RAM measurements aggregate private working set values for `ollama` and `llama` processes and convert them into megabytes, making the results directly usable in profiling tables.

The script also introduces mean and standard deviation calculations, CSV export, and thesis-style console summaries. These additions make it suitable for academic benchmarking pipelines and later statistical analysis. One implementation detail should be noted carefully: the reporting text references `5 sample runs`, but the current `runsPerScenario` value is set to `1`. For final thesis documentation, this mismatch should be corrected so that the written explanation aligns with the executed configuration.

### Green Computing & Resource Optimization

From a sustainable computing perspective, these three files collectively examine process priority as a software-level energy moderation strategy. Lowering a background inference engine to `BelowNormal` does not necessarily reduce instantaneous compute work in a strict algorithmic sense, but it can reduce contention with interactive workloads, smooth CPU scheduling, and decrease the likelihood of foreground disruption. On constrained edge devices, this is a meaningful systems-level optimization.

This experiment family also illustrates a broader Green AI principle: optimization does not have to come only from model compression or token reduction. It can also emerge from operating-system-aware orchestration, where inference is treated as one schedulable workload among many. In other words, sustainable AI behavior can be improved through intelligent runtime governance, not only through model-level changes.

### Research Relevance

For the proposed PhD direction in Green AI and Sustainable Software Engineering, the `experiment3-resource-throttling` series is highly significant because it links LLM inference behavior to host-level scheduling policy. It moves the discussion beyond isolated model performance and into the practical realities of edge-cloud coexistence, where responsiveness, fairness, latency stability, and energy-aware orchestration must be considered together.

Conceptually, the progression across the three files is clear:

- `exp03-process-priority-throttling.ts` establishes the baseline priority-switching experiment

- `exp03-process-priority-throttling-repeated.ts` improves repeatability and measurement discipline

- `exp03-process-priority-throttling-improved.ts` adds system telemetry, statistical summaries, and publication-ready outputs

Together, they form a coherent mini-benchmark suite for evaluating whether Green Mode process throttling can maintain acceptable inference quality while reducing host-system pressure in local-first AI environments.

---
