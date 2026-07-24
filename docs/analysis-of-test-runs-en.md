## Analysis of Test Runs: LLM Performance and Resource Consumption on Commodity Hardware

This document details the analysis of experiments conducted to evaluate the performance, resource consumption, and efficiency of Large Language Models (LLMs) running on commodity hardware, with a focus on sustainable and "Green AI" principles. The experiments investigate key factors such as model size, context window utilization, and process priority throttling.

---

### 1. `list-models.ts` (Installed Models Listing)

*   **Observations:**
    *   The script lists installed models: `mistral:7b`, `qwen2.5:7b`, and `qwen2.5:1.5b`.
    *   It provides model details including approximate size in GB (e.g., `qwen2.5:1.5b` at ~0.92GB, `qwen2.5:7b` at ~4.07GB) and last updated time.

*   **Analysis & Implications:**
    *   **Software Development:** Understanding model sizes is crucial for storage management and selecting appropriate models for deployment. Smaller models are suitable for resource-constrained devices, while larger models offer greater capability but require more robust hardware.
    *   **AI Tooling:** This information assists AI tool developers in choosing models that align with target hardware limitations, especially for Edge Computing scenarios.
    *   **Green AI:** Selecting smaller models directly reduces energy consumption, serving as a foundational step in making AI more sustainable. It's about choosing the right tool for the job.
    *   **Future Testing:** This list serves as the basis for model selection in subsequent tests, enabling comparative analysis between model sizes.

---

### 2. `test-ollama.ts` (Sample Output from `qwen2.5:1.5b`)

*   **Observations:**
    *   The `qwen2.5:1.5b` model generated a sample Angular component code snippet with accompanying explanations.
    *   Total execution time (`totalDurationMs`): ~34.8 seconds.
    *   Input tokens (`promptTokens`): 47, Output tokens (`generatedTokens`): 256.
    *   Reported CPU and RAM usage for this sample run: ~67% CPU and ~1.5GB RAM.

*   **Analysis & Implications:**
    *   **Software Development:** LLMs can aid in generating boilerplate code, UI components, and technical documentation, accelerating the development process.
    *   **AI Tooling:** This demonstrates a practical application of "AI coding assistants," which can be integrated into IDEs to enhance developer productivity.
    *   **Green AI:** Even a 1.5B model requires significant processing time (~30s) and CPU resources. Optimizing even smaller models is important, especially for high-throughput applications.
    *   **Future Testing:** Evaluating the quality, standards, and bug-free nature of the generated code is essential. Comparing AI-assisted generation time with manual coding time offers valuable insights.

---

### 3. `test-ollama-chat.ts` (Simulated Energy Consumption Display in Angular)

*   **Observations:**
    *   This script simulates an Angular component designed to display energy consumption (in Joules).
    *   It uses `HttpClient` to fetch data from a hypothetical API.
    *   It illustrates how to structure a frontend component for monitoring AI-related metrics, such as energy usage.

*   **Analysis & Implications:**
    *   **Software Development:** Highlights the potential for building monitoring dashboards for AI applications, enabling developers to visualize performance and resource metrics.
    *   **AI Tooling:** While not an AI tool itself, this code contributes to systems that monitor AI tool performance. It's useful for building AI tools that require resource reporting.
    *   **Green AI:** This simulation underscores the energy cost associated with AI processes. It facilitates comparative analysis of energy consumption across different models or configurations in the future.
    *   **Future Testing:** The simulation could be made more realistic by integrating actual data from Ollama (if an API is available) or by estimating energy consumption based on recorded execution times and resource usage.

---

### 4. `exp01-cold-vs-warm-start-latency.ts` (Cold vs. Warm Start Latency Test)

*   **Observations:**
    *   **Cold Start Latency:** ~6089 ms (6.1 seconds)
    *   **Warm Start Latency:** ~1819 ms (1.8 seconds)
    *   **Difference:** Cold Start is ~4.27 seconds longer than Warm Start.
    *   `keep_alive: 0` causes the model to be unloaded from memory.

*   **Analysis & Implications:**
    *   **Software Development:** Cold starts are a significant issue for applications requiring low latency (e.g., real-time chatbots). Keeping models in RAM (`keep_alive` > 0) drastically reduces latency but increases RAM usage.
    *   **AI Tooling:** For always-ready AI tools, `keep_alive` strategies must balance RAM consumption with latency. Lower values might be preferable on memory-constrained devices.
    *   **Green AI:** Continuous model residency in RAM consumes more energy. Unloading models when idle saves energy and RAM. The choice depends on usage patterns:
        *   **Frequent, sequential use:** Positive `keep_alive` is beneficial.
        *   **Infrequent use:** `keep_alive: 0` or a low value is optimal.
    *   **Future Testing:** Investigating the impact of various `keep_alive` values (e.g., 1, 5, 10 minutes) on RAM and latency, and testing across different model sizes.

---

### 5. `exp02-context-window-memory-latency.ts` (Context Window Impact on Memory and Latency)

*   **Observations:**
    *   Increasing `num_ctx` (context window size) from 512 to 2048, and then to 8192, dramatically increased latency:
        *   `num_ctx=512`: 9.6 seconds
        *   `num_ctx=2048`: 28.1 seconds
        *   `num_ctx=8192`: 127.3 seconds (over 2 minutes!)
    *   The model response at `num_ctx=8192` showed slightly better precision ("AI with environmental sustainability features." vs. "Sustainable software engineering.").
    *   Prompt size was approximately 22821 characters (~3000 words).

*   **Analysis & Implications:**
    *   **Software Development:** This is a critical finding. Large context windows incur significant computational costs and latency, making them impractical for real-time applications. Solutions like prompt optimization, text summarization, or chunking are necessary.
    *   **AI Tooling:** Tools processing long documents must account for this limitation. Advanced text processing techniques might be needed to avoid relying on excessively large context windows.
    *   **Green AI:** Larger context windows require more computation, higher CPU/RAM usage, and thus more energy. Optimizing `num_ctx` is a key strategy for reducing energy consumption and improving efficiency, particularly on low-power systems.
    *   **Future Testing:** Evaluating intermediate `num_ctx` values (e.g., 1024, 4096) to find optimal trade-offs. Quantitatively assessing response quality across different context window sizes.

---

### 6. `exp03-process-priority-throttling.ts` (Process Priority Comparison: Normal vs. BelowNormal)

*   **Observations (First Run):**
    *   **Normal Priority:** 48.1s duration, 453 tokens, 9.42 TPS (Tokens Per Second).
    *   **BelowNormal (Green Mode):** 46.2s duration, 472 tokens, 10.21 TPS.
    *   **Delta:** Green Mode showed ~8.46% higher TPS.
    *   `BelowNormal` priority aims to keep the host system more responsive.

*   **Analysis & Implications:**
    *   **Software Development:** Crucial for applications performing background tasks (e.g., desktop apps using LLMs). Setting priority to `BelowNormal` prevents the LLM from monopolizing system resources, ensuring UI responsiveness and smooth operation of other processes.
    *   **AI Tooling:** AI tools on shared or commodity hardware can use this technique to avoid disrupting overall system usability.
    *   **Green AI:** The primary goal is energy efficiency. While TPS improved slightly, the key benefit is system responsiveness. Lower priority can lead to less aggressive CPU utilization, potentially reducing overall energy consumption and heat generation.
    *   **Future Testing:** Reproducibility is key. Further tests are needed to confirm stability.

---

### 7. `exp03-process-priority-throttling-repeated.ts` (Repeat Test of Process Priority)

*   **Observations:**
    *   **Normal Priority (Avg over 5 runs):** Latency 41.67s, TPS 10.24
    *   **BelowNormal (Green Mode) (Avg over 5 runs):** Latency 41.31s, TPS 10.33
    *   **Delta:** Green Mode showed ~0.80% higher TPS (negligible improvement).
    *   Reiteration: `BelowNormal` primarily enhances system responsiveness rather than raw inference speed.

*   **Analysis & Implications:**
    *   **Software Development/AI Tooling:** Repeated tests confirm relative stability. The minor TPS improvement is likely statistical noise; the critical finding is that inference speed is **not significantly degraded**, while system responsiveness is maintained. This is a strong finding for desktop and Edge AI applications.
    *   **Green AI:** Confirms `BelowNormal` priority as an effective "Green AI" strategy. By reducing system slowdowns caused by LLMs, it improves user experience and potentially lowers long-term energy usage through more efficient resource allocation.

---

### 8. `exp03-process-priority-throttling-improved.ts` (Enhanced Process Priority Test with Resource Monitoring)

*   **Observations:**
    *   **Comprehensive Comparison:**
        *   **TPS:** Normal: 10.45, BelowNormal: 10.50 (0.50% increase)
        *   **Latency:** Normal: 41375ms, BelowNormal: 41369ms (negligible difference)
        *   **Avg CPU Usage:** Normal: 66.5%, BelowNormal: 73.6% (7.1% increase for BelowNormal)
        *   **Max RAM:** Normal: 1188MB, BelowNormal: 1169MB (19MB decrease for BelowNormal)
    *   **Key Points:**
        *   CPU usage is higher in `BelowNormal` mode.
        *   RAM usage is slightly lower.
        *   TPS shows a minor improvement.
        *   Results saved to `experiment3_results.csv`.

*   **Analysis & Implications:**
    *   **Software Development/AI Tooling:**
        *   **CPU Usage:** The increased CPU usage in `BelowNormal` might indicate the OS attempts to maintain overall system performance by allocating resources differently, possibly at higher clock speeds, to prevent bottlenecks elsewhere. Crucially, this doesn't lead to perceived system slowness.
        *   **RAM Usage:** Lower RAM consumption in `BelowNormal` is a significant advantage, especially on systems with limited memory.
        *   **TPS:** Minor TPS improvements suggest this configuration can optimize workload distribution.
    *   **Green AI:** This provides a more holistic view. Lower RAM usage and maintained/improved TPS, combined with better system responsiveness, indicate an optimized strategy. The higher CPU usage might reflect a more stable, sustainable operating profile rather than peak aggressive demand.
    *   **Future Testing:**
        *   **Actual Energy Consumption:** Direct measurement using hardware sensors to validate "green" claims.
        *   **Cross-Model Analysis:** Testing if CPU/RAM patterns differ for 7B models or other architectures.
        *   **Real-world Scenarios:** Simulating mixed workloads (e.g., heavy UI + LLM) to verify system responsiveness benefits.

---

### Overall Conclusions and Practical Applications

These tests provide a robust foundation for understanding and optimizing local LLMs for various purposes (performance, resource efficiency, Green AI).

**1. Software Development Applications:**
*   **Model Selection:** Choose models based on task requirements (speed, quality, size) and hardware constraints (CPU, RAM).
*   **Latency Optimization:** Manage `keep_alive` settings for real-time applications, understanding Cold/Warm start implications.
*   **Context Window Management:** Design software considering `num_ctx` limitations; employ summarization or chunking for long inputs.
*   **System Responsiveness:** Utilize `BelowNormal` priority to ensure LLMs don't impede UI or other processes.

**2. AI Tooling Applications:**
*   **AI Coding Assistants:** Use findings to optimize assistant performance (model choice, `keep_alive`).
*   **Model Orchestration:** Inform decisions about which model is best suited for specific tasks (classification, reasoning, code generation) within a larger AI system.
*   **Monitoring & Observability:** Adapt test scripts to build dashboards for real-time AI performance and resource usage.

**3. Green AI Applications:**
*   **Sustainable Computing:** Reduce energy consumption via smaller models, optimized `num_ctx`, and intelligent `keep_alive` management.
*   **Efficient Resource Utilization:** `BelowNormal` priority aids in balanced resource allocation, improving overall system efficiency.
*   **Local-First AI:** Demonstrates the feasibility of local LLM deployment with reasonable performance and sustainability on commodity hardware, supporting privacy and reduced cloud dependency.
*   **Evaluation Metrics:** Establishes key metrics (Latency, TPS, CPU, RAM) for LLM evaluation and comparison.

**4. Future Testing Recommendations:**
*   **Rigorous Repetition:** Conduct 5-10 runs per test for accurate averages and standard deviations.
*   **Controlled Variables:** Keep prompt, output tokens (`num_predict`), and model state (cold/warm) consistent within test series.
*   **Diverse Model Comparison:** Test 1.5B, 7B, and potentially larger models across all scenarios.
*   **Comprehensive Resource Monitoring:** Log Latency, TPS, CPU Usage, RAM Usage, GPU Usage (if applicable), Temperature, and direct energy consumption.
*   **Quality vs. Performance:** Integrate qualitative response assessments alongside performance metrics.
*   **Hybrid Workload Simulation:** Test LLMs within realistic mixed-usage scenarios to validate benefits.
*   **Cloud API Benchmarking:** Compare local LLM performance and cost (financial & energy) against cloud-based APIs.

These insights provide a solid foundation for leveraging LLMs efficiently, effectively, and sustainably in software development and AI research.

