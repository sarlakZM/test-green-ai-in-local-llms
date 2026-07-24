
# Command Output Analysis

This document presents the raw output from various TypeScript Node.js scripts used for benchmarking and testing local LLM inference.

---

## 1. `list-models.ts`

*   **Command:** `npx ts-node .\list-models.ts`
*   **Output:**
    ```    ┌─────────┬────────────────────┬────────┬─────────────────────────────────────┐
    │ (index) │ name               │ sizeGB │ modifiedAt                          │
    ├─────────┼────────────────────┼────────┼─────────────────────────────────────┤
    │ 0       │ 'mistral:7b'       │ '4.07' │ '2026-07-23T04:14:38.9167101+03:30' │
    │ 1       │ 'qwen2.5-coder:7b' │ '4.36' │ '2026-07-23T04:13:05.6882352+03:30' │
    │ 2       │ 'qwen2.5:1.5b'     │ '0.92' │ '2026-07-23T04:12:17.7458343+03:30' │
    └─────────┴────────────────────┴────────┴─────────────────────────────────────┘
    ```

---

## 2. `test-ollama.ts`

*   **Command:** `npx ts-node .\test-ollama.ts`
*   **Testing Model:** `qwen2.5:1.5b`
*   **Output Snippet:**
    ```
    --- Model response ---

    Certainly! Below is an example of a minimal Angular standalone component that uses signals for communication between components and `OnPush` change detection.

    ### Minimal Angular Standalone Component Example

    typescript
    // app.component.ts
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html'
    })
    export class AppComponent {
      title = 'Minimal Angular Component';
    }


    ### Minimal Angular Template (HTML)

    html
    <!-- app.component.html -->
    <ng-template #template>
      <h1>{{ title }}</h1>
    </ng-template>

    <button (click)="toggleSignal()">Toggle Signal</button>

    ### Minimal Angular Module

    // app.module.ts
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';

    import { AppComponent } from './app.component';

    @NgModule({
      declarations: [
        AppComponent,
      ],
      imports: [
        BrowserModule,
      ],
      providers: [],
      bootstrap: [AppComponent]
    })
    export class AppModule {}

    ### Minimal Angular Component (Signal)

    // signal.component.ts
    import { Component, Input, Output, EventEmitter } from '@angular/core';

    @Component({
      selector: 'signal-component',
      templateUrl: './signal
      ....

    ```

    --- Metadata ---
    ```
    {
      model: 'qwen2.5:1.5b',
      done: true,
      promptTokens: 47,
      generatedTokens: 256,
      totalDurationMs: 34825.6888
    }
    ```

---

## 3. `test-ollama-chat.ts`

*   **Command:** `npx ts-node .\test-ollama-chat.ts`
*   **Output Snippet:**
    ```typescript
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-energy-consumption',
      templateUrl: './energy-consumption.component.html',
      styleUrls: ['./energy-consumption.component.css']
    })
    export class EnergyConsumptionComponent {
      energyConsumption = 0;

      constructor() {}

      ngOnInit(): void {
        // Simulate fetching data from an API
        this.fetchEnergyData();
      }

      fetchEnergyData(): void {
        // Replace with actual API call or service method to get the energy consumption
        setTimeout(() => {
          this.energyConsumption = Math.random() * 100; // Random value for demonstration
        }, 2000);
      }
    }
    ```

    ```typescript
    <!-- templates/energy-consumption.component.html -->
    <div>
      <h3>Energy Consumption</h3>
      <p>The AI inference request has consumed {{ energyConsumption }} Joules of energy.</p>
    </div>

    <style>
      /* Add your styles here */
    </style>
    ```

    ```typescript
    // services/api.service.ts (or any service responsible for fetching data)
    import { Injectable } from '@angular/core';
    import { HttpClient, HttpHeaders } from '@angular/common/http';

    @Injectable({
      providedIn: 'root'
    })
    export class ApiService {
      private apiUrl = 'https://api.example.com/energy-consumption'; // Replace with actual API URL

      constructor(private http: HttpClient) {}

      fetchEnergyData(): void {
        this.http.get(this.apiUrl).subscribe(response => {
          this.energyConsumption = response.data; // Assuming the API returns an object with energy consumption
        });
      }
    }
    ```

    This code snippet demonstrates a standalone Angular component that displays the energy consumption of an AI inference request. It includes:
    - A `EnergyConsumptionComponent` class for the component logic.
    - An `apiService` to simulate fetching data from an external API, which is then used in the component's `fetchEnergyData()` method.
    - A simple HTML template with a message indicating the energy consumption.

    Remember to replace the placeholder URL and service implementation with actual values or configurations that fit your application.
    ```

---

## 4. `exp01-cold-warm-start-latency.ts`

*   **Command:** `npx ts-node .\exp01-cold-warm-start-latency.ts`
*   **Output:**
    ```
    === Experiment 1: Measuring keep_alive & Cold Starts ===
    Forcing model unload by sending keep_alive: 0...
    Model unloaded. Waiting 2 seconds for system cleanup...
    Sending Request 1 (Cold Start)...
    Cold Start Latency: 6089ms

    Sending Request 2 (Warm Start)...
    Warm Start Latency: 1819ms

    Re-unloading model (keep_alive: 0)...
    Unload Request Time (Response + Unload): 2060ms

    Analysis: Cold Start took 4.27s longer than Warm Start.
    ```

---

## 5. `exp02-context-window-memory-latency.ts`

*   **Command:** `npx ts-node .\exp02-context-window-memory-latency.ts`
*   **Output:**
    ```
    === Experiment 2: Context Window & Truncation ===
    Generated prompt length: 22821 characters.
    Running configurations...
    [num_ctx: 512] Latency: 11154ms | Response: "Sustainable software engineering"
    [num_ctx: 2048] Latency: 28306ms | Response: "Sustainable Software Engineering"
    [num_ctx: 8192] Latency: 126071ms | Response: "Sustainable software."
    ```

---

## 6. `exp03-process-priority-throttling.ts`

*   **Command:** `npx ts-node .\exp03-process-priority-throttling.ts`
*   **Output:**
    ```
    === Experiment 3: Resource Throttling & Priority ===

    --- Scenario A: Normal Priority ---
    Successfully set Ollama process priority to: Normal
    [Normal Priority] Completed. Time: 48108ms | Generated: 453 tokens | TPS: 9.42
    Waiting 3 seconds for CPU cooling...

    --- Scenario B: BelowNormal Priority (Green Mode) ---
    Successfully set Ollama process priority to: BelowNormal
    [Green Mode] Completed. Time: 46217ms | Generated: 472 tokens | TPS: 10.21

    === Comparative Analysis ===
    Normal TPS: 9.42 | Green TPS: 10.21
    Performance Delta (TPS reduction): -8.46%
    Note: Running under 'BelowNormal' keeps the host system highly responsive during long training/inference jobs.
    ```

---

## 7. `exp03-process-priority-throttling-repeated.ts`

*   **Command:** `npx ts-node .\exp03-process-priority-throttling-repeated.ts`
*   **Output:**
    ```
    === Experiment 3: Resource Throttling & Priority ===

    --- Scenario A: Normal Priority ---
    Successfully set Ollama process priority to: Normal
    [Normal Run 1] Completed. Time: 41488ms | Generated: 420 tokens | TPS: 10.40
    [Normal Run 2] Completed. Time: 41362ms | Generated: 420 tokens | TPS: 10.30
    [Normal Run 3] Completed. Time: 41562ms | Generated: 420 tokens | TPS: 10.26
    [Normal Run 4] Completed. Time: 41633ms | Generated: 420 tokens | TPS: 10.22
    [Normal Run 5] Completed. Time: 42316ms | Generated: 420 tokens | TPS: 10.06

    Waiting 5 seconds before next scenario...

    --- Scenario B: BelowNormal Priority (Green Mode) ---
    Successfully set Ollama process priority to: BelowNormal
    [BelowNormal Run 1] Completed. Time: 41299ms | Generated: 420 tokens | TPS: 10.32
    [BelowNormal Run 2] Completed. Time: 40454ms | Generated: 420 tokens | TPS: 10.53
    [BelowNormal Run 3] Completed. Time: 41345ms | Generated: 420 tokens | TPS: 10.30
    [BelowNormal Run 4] Completed. Time: 42047ms | Generated: 420 tokens | TPS: 10.19
    [BelowNormal Run 5] Completed. Time: 41416ms | Generated: 420 tokens | TPS: 10.30

    === Normal Priority Summary ===
    Average Latency: 41672.20ms
    Average Tokens : 420.00
    Average TPS    : 10.24

    === Green Mode Summary ===
    Average Latency: 41312.20ms
    Average Tokens : 420.00
    Average TPS    : 10.33

    === Comparative Analysis ===
    Normal Avg TPS: 10.24
    Green Avg TPS : 10.33
    Performance Delta (TPS reduction): -0.80%
    Note: 'BelowNormal' is mainly for host responsiveness and sustainable local execution, not guaranteed higher raw speed.
    ```

---

## 8. `exp03-process-priority-throttling-improved.ts`

*   **Command:** `npx ts-node .\exp03-process-priority-throttling-improved.ts`
*   **Output:**
    ```
    ===========================================================
    STARTING EXPERIMENT 3: RESOURCE THROTTLING & GREEN BENCHMARK
    ===========================================================

    --- Activating Scenario A: Normal Priority ---
    [OS OS-Level] Ollama process priority set to: Normal
    [Run 1] Time: 41458ms | TPS: 10.45 | Avg CPU: 51.7% | Max RAM: 1188MB
    [Run 2] Time: 41170ms | TPS: 10.36 | Avg CPU: 69.3% | Max RAM: 1190MB
    [Run 3] Time: 41371ms | TPS: 10.45 | Avg CPU: 69.7% | Max RAM: 1190MB
    [Run 4] Time: 41564ms | TPS: 10.47 | Avg CPU: 69.3% | Max RAM: 1183MB
    [Run 5] Time: 41311ms | TPS: 10.50 | Avg CPU: 72.8% | Max RAM: 1190MB

    Waiting 8 seconds before switching scenarios to clear hardware states...

    --- Activating Scenario B: BelowNormal Priority (Green Mode) ---
    [OS OS-Level] Ollama process priority set to: BelowNormal
    [Run 1] Time: 41406ms | TPS: 10.51 | Avg CPU: 76.5% | Max RAM: 1190MB
    [Run 2] Time: 40901ms | TPS: 10.57 | Avg CPU: 68.3% | Max RAM: 1190MB
    [Run 3] Time: 41636ms | TPS: 10.46 | Avg CPU: 70.0% | Max RAM: 1191MB
    [Run 4] Time: 41218ms | TPS: 10.47 | Avg CPU: 76.7% | Max RAM: 1190MB
    [Run 5] Time: 41684ms | TPS: 10.48 | Avg CPU: 76.5% | Max RAM: 1083MB

    [Export] Detailed benchmark results saved to: F:\AIPractice\Angular-AI-Practice\test-green-ai-in-local-llms\experiment3_results.csv

    ================================================================================
                     ACADEMIC COMPARISON TABLE (FOR THESIS PROPOSAL)         
    ================================================================================
    | Metric                  | Normal Priority (Default) | BelowNormal (Green Mode) | Delta (%) |
    --------------------------------------------------------------------------------
    | Throughput (TPS)        | 10.45 ± 0.05      | 10.50 ± 0.04      | 0.50%    |
    | Request Latency (ms)    | 41375 ± 133       | 41369 ± 288       | -0.01%    |
    | Avg CPU Usage (%)       | 66.5%                    | 73.6%                    | 7.1% (Diff)|
    | Max Process memory (MB) | 1188 MB                 | 1169 MB                 | -19 MB (Diff)|
    ================================================================================
    Note: Values formatted as Mean ± Standard Deviation over 5 sample runs.
    ================================================================================
    ``````