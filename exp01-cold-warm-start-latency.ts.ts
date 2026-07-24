// backend/test/experiment1.ts

// هدف این آزمایش، اندازه‌گیری زمان لود شدن مدل در حافظه (RAM) در بار اول (Cold Start) و مقایسه آن با بارهای بعدی (Warm Start) و همچنین بررسی رفتار مدل هنگام استفاده از keep_alive: 0 است.
import axios from 'axios';
import { OLLAMA_API, TEST_MODEL } from './config';

async function sendRequest(keepAliveValue: string | number): Promise<number> {
  const startTime = Date.now();
  
  try {
    await axios.post(OLLAMA_API, {
      model: TEST_MODEL,
      prompt: "Why is the sky blue? Answer in one short sentence.",
      stream: false,
      keep_alive: keepAliveValue // اعمال پارامتر نگهداشت حافظه در سطح ریشه درخواست
    });
  } catch (error) {
    console.error("API Error:", error);
  }
  
  return Date.now() - startTime;
}

async function runExperiment1() {
  console.log("=== Experiment 1: Measuring keep_alive & Cold Starts ===");
  
  // گام ۱: تخلیه اجباری مدل از حافظه (Unload)
  console.log("Forcing model unload by sending keep_alive: 0...");
  await sendRequest(0); 
  console.log("Model unloaded. Waiting 2 seconds for system cleanup...");
  await new Promise(r => setTimeout(r, 2000));

  // گام ۲: تست اول (Cold Start - مدل باید از دیسک لود شود)
  console.log("Sending Request 1 (Cold Start)...");
  const t1 = await sendRequest("5m"); // مدل را ۵ دقیقه در رم نگه دار
  console.log(`Cold Start Latency: ${t1}ms\n`);

  // گام ۳: تست دوم (Warm Start - مدل در رم حضور دارد)
  console.log("Sending Request 2 (Warm Start)...");
  const t2 = await sendRequest("5m");
  console.log(`Warm Start Latency: ${t2}ms\n`);

  // گام ۴: تخلیه مجدد و بررسی تفاوت
  console.log("Re-unloading model (keep_alive: 0)...");
  const t3 = await sendRequest(0);
  console.log(`Unload Request Time (Response + Unload): ${t3}ms`);
  
  console.log(`\nAnalysis: Cold Start took ${((t1 - t2)/1000).toFixed(2)}s longer than Warm Start.`);
}

runExperiment1();


// === Experiment 1: Measuring keep_alive & Cold Starts ===
// Forcing model unload by sending keep_alive: 0...
// Model unloaded. Waiting 2 seconds for system cleanup...
// Cold Start Latency: 6341ms
// Sending Request 2 (Warm Start)...
// Warm Start Latency: 2024ms

// Re-unloading model (keep_alive: 0)...
// Unload Request Time (Response + Unload): 2654ms

// Analysis: Cold Start took 4.32s longer than Warm Start.