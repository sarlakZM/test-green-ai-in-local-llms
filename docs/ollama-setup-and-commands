
I'll organize it into logical sections, similar to your original structure, and ensure all the technical details are accurately represented.


# Ollama Commands and Configuration Guide

This guide provides a comprehensive overview of Ollama commands, API endpoints, monitoring tools, model management, environment variable settings, and troubleshooting tips, primarily focusing on Windows environments.

---

## 1) Core CLI Commands


| Command | Purpose | Example | Notes |
|---|---|---|---|
| `ollama run <model>` | Run a model and start a chat session. | `ollama run qwen2.5:3b` | If the model is not downloaded, it will be pulled first. |
| `ollama pull <model>` | Download a model. | `ollama pull mistral:7b` | Used to fetch models from the registry. |
| `ollama ls` | List installed models. | `ollama ls` | This command is used in the new official documentation for listing models. |
| `ollama list` | List installed models. | `ollama list` | Common in older/different versions; works fine if functional. |
| `ollama ps` | List running models. | `ollama ps` | Shows which models are loaded into RAM/GPU. |
| `ollama stop <model>` | Stop a running model. | `ollama stop qwen2.5:3b` | Unloads the model from memory. |
| `ollama serve` | Run the local Ollama server. | `ollama serve` | Starts the API on `localhost:11434`. |
| `ollama create -f Modelfile` | Create a custom model. | `ollama create -f Modelfile` | Uses a Modelfile to build a new model. |
| `ollama show <model>` | Display model details. | `ollama show qwen2.5:3b` | Behavior/availability may vary depending on the version. |

---

## 2) Local Ollama API Commands

The local API is typically available at:

```text
http://localhost:11434
```

| Endpoint | Purpose | Example | Output / Description |
|---|---|---|---|
| `GET /api/version` | Get server version. | `curl.exe http://localhost:11434/api/version` | Returns the actual Ollama Server version. |
| `GET /api/tags` | List installed models. | `curl.exe http://localhost:11434/api/tags` | API equivalent for `ls/list`. |
| `GET /api/ps` | Running models. | `curl.exe http://localhost:11434/api/ps` | API equivalent for `ps`. |
| `POST /api/generate` | Generate text from a prompt. | See example below | For simple completion. |
| `POST /api/chat` | Multi-turn conversation. | See example below | For chat-based usage. |

### `generate` Example (PowerShell)

```powershell
Invoke-WebRequest `
  -Method POST `
  -Body '{"model":"qwen2.5:3b","prompt":"Why is the sky blue?","stream":false}' `
  -Uri http://localhost:11434/api/generate
```

### `chat` Example (PowerShell)

```powershell
Invoke-WebRequest `
  -Method POST `
  -Body '{"model":"qwen2.5:3b","messages":[{"role":"user","content":"Why is the sky blue?"}],"stream":false}' `
  -Uri http://localhost:11434/api/chat
```

---

## 3) Monitoring and Status Commands

| Command | Purpose | Example | Description |
|---|---|---|---|
| `ollama ps` | View loaded models. | `ollama ps` | Shows resource consumption of active models. |
| `ollama ls` | View installed models. | `ollama ls` | Models present on disk. |
| `curl.exe http://localhost:11434/api/ps` | API monitoring. | — | Better for scripting. |
| `curl.exe http://localhost:11434/api/version` | Check server health. | — | Responding indicates the server is up. |
| `Get-Process ollama` | View Ollama process in Windows. | `Get-Process ollama` | To check if the service is running. |
| `tasklist | findstr ollama` | View processes in CMD. | `tasklist | findstr ollama` | Lightweight equivalent in Command Prompt. |

### Health Check Example (PowerShell)

```powershell
curl.exe http://127.0.0.1:11434/api/version
curl.exe http://127.0.0.1:11434/api/tags
curl.exe http://127.0.0.1:11434/api/ps
```

---

## 4) Model Management Commands

| Command | Purpose | Example | Description |
|---|---|---|---|
| `ollama pull <model>` | Download model. | `ollama pull qwen2.5:1.5b` | Downloads the model if it doesn't exist. |
| `ollama run <model>` | Run model. | `ollama run mistral:7b` | Runs the model and downloads if necessary. |
| `ollama stop <model>` | Stop model. | `ollama stop mistral:7b` | Unloads from memory. |
| `ollama create -f Modelfile` | Create new model. | `ollama create -f Modelfile` | For customizing behavior. |
| `ollama rm <model>` | Remove model. | `ollama rm qwen2.5:1.5b` | If your version supports this command. |

### Practical Example

To test with a lightweight model:

```powershell
ollama pull qwen2.5:1.5b
ollama run qwen2.5:1.5b
```

---

## 5) Important Environment Variables

These are crucial for configuring Ollama's behavior, especially on Windows.

| Variable | Purpose | Sample Value | Notes |
|---|---|---|---|
| `OLLAMA_HOST` | Server bind address. | `127.0.0.1:11434` | To change host/port. |
| `OLLAMA_MODELS` | Model storage path. | `D:\ollama-models` | To relocate the models folder. |
| `OLLAMA_CONTEXT_LENGTH` | Default context length. | `4096` | For long-context models. |
| `OLLAMA_KEEP_ALIVE` | Model retention time in RAM. | `5m` | `0` means immediate unload. |
| `OLLAMA_MAX_QUEUE` | Maximum request queue. | `64` | For concurrency control. |
| `OLLAMA_ORIGINS` | Allowed origins for browser apps. | `chrome-extension://*` | For extensions/web apps. |
| `HTTPS_PROXY` | Proxy for model downloads. | `http://127.0.0.1:7890` | For downloading via proxy. |
| `GGML_VK_VISIBLE_DEVICES` | GPU selection in Vulkan. | `0` | Specific to certain setups. |

### Setting Variables in PowerShell

```powershell
$env:OLLAMA_MODELS = "D:\ollama-models"
$env:OLLAMA_KEEP_ALIVE = "10m"
$env:OLLAMA_CONTEXT_LENGTH = "8192"
```

> After changing variables, you usually need to **Quit** and restart Ollama.

---

## 6) Recommended Settings for Windows

| Task | Command / Path | Description |
|---|---|---|
| Fully close Ollama | `Quit` option from tray | Closing the window is not enough. |
| Open Logs | `%LOCALAPPDATA%\Ollama` | `server.log` files and older logs. |
| Executable Path | `%LOCALAPPDATA%\Programs\Ollama` | Typical installation location. |
| Models Location | `%HOMEPATH%\.ollama\models` | Default location for model storage. |
| Run Application | From Start Menu | Must be restarted after changing env vars. |
| Check Process | `Get-Process ollama` | To ensure it's running. |

---

## 7) Network and Connection Commands

| Command | Purpose | Example | Description |
|---|---|---|---|
| `nslookup registry.ollama.ai` | Check DNS. | `nslookup registry.ollama.ai` | For `EOF` errors and pull issues. |
| `curl.exe -I https://registry.ollama.ai/v2/` | Test registry access. | — | No response indicates network/proxy issues. |
| `Test-NetConnection localhost -Port 4873` | Test Verdaccio. | — | For local npm registry. |
| `Get-NetTCPConnection -LocalPort 11434` | Check Ollama port. | — | See if the port is occupied. |
| `Get-NetFirewallRule` | Check firewall. | — | For connection blocking. |
| `ipconfig /flushdns` | Flush DNS cache. | — | For resolve issues. |

### API Detection Example (PowerShell)

```powershell
curl.exe http://127.0.0.1:11434/api/version
```

If it doesn't respond:
- The server is not running.
- Or the port has changed.
- Or `OLLAMA_HOST` has been modified.

---

## 8) System Troubleshooting Commands in Windows

| Command | Purpose | Example | Description |
|---|---|---|---|
| `Get-Command ollama -All` | View all Ollama paths. | — | To identify multiple installations. |
| `where.exe ollama` | Check PATH directories. | — | Crucial for conflicts. |
| `Get-CimInstance Win32_Process` | View executable path. | — | To find the actual server executable. |
| `taskkill /F /IM ollama.exe /T` | Force close Ollama. | — | For a clean restart. |
| `Stop-Process -Name ollama -Force` | Stop process. | — | PowerShell equivalent. |
| `Get-Process ollama` | Check process status. | — | Quick and easy. |
| `Get-ChildItem Env:` | View environment variables. | — | For proxy and path settings. |
| `Remove-Item Env:HTTPS_PROXY` | Remove session proxy. | — | To test direct connection. |

### Finding the Actual Ollama Path Example (PowerShell)

```powershell
Get-Command ollama -All | Select-Object Source
where.exe ollama
Get-CimInstance Win32_Process |
  Where-Object Name -EQ "ollama.exe" |
  Select-Object ProcessId, ExecutablePath, CommandLine
```

---

## 9) Common Error Resolution Patterns

| Error | Potential Cause | Solution |
|---|---|---|
| `EOF` during `pulling manifest` | Network, DNS, proxy, TLS issues | Test registry, change VPN, flush DNS. |
| `could not connect to a running Ollama instance` | Server not running | Run `ollama serve` or restart the application. |
| `connection refused` | Service not on port | Check `localhost:11434` and the process. |
| `npm ECONNREFUSED localhost:4873` | Verdaccio not running | Change registry or start Verdaccio. |
| `model not found` | Model not yet pulled | Run `ollama pull <model>`. |
| `bind address in use` | Port is occupied | Find the process using port 11434. |

---

# Highly Useful Table: Scenario → Command → Expected Result

| Scenario | Suggested Command | Expected Result |
|---|---|---|
| Check actual server version | `curl.exe http://127.0.0.1:11434/api/version` | JSON version output |
| View installed models | `ollama ls` or `ollama list` | List of models |
| View running models | `ollama ps` | Loaded models |
| Download a model | `ollama pull qwen2.5:3b` | Download manifest and blobs |
| Run a model | `ollama run qwen2.5:3b` | Enter chat session |
| Stop a model | `ollama stop qwen2.5:3b` | Unload from RAM |
| Check registry access | `curl.exe -I https://registry.ollama.ai/v2/` | HTTP response |
| Find installation conflicts | `where.exe ollama` | Multiple paths listed |
| Set model storage path | `$env:OLLAMA_MODELS="D:\models"` | Models saved to the new path |
| Clear DNS cache | `ipconfig /flushdns` | Resolve issues fixed |

---

# A Minimal Version for Daily Use

If I had to summarize the most crucial Ollama commands for practical daily use, these are the golden 10:

```powershell
ollama serve
ollama pull qwen2.5:3b
ollama run qwen2.5:3b
ollama ls
ollama ps
ollama stop qwen2.5:3b
curl.exe http://127.0.0.1:11434/api/version
curl.exe http://127.0.0.1:11434/api/tags
where.exe ollama
Get-Process ollama

ollama run qwen2.5:1.5b "Reply with exactly: Ollama is working"                              

Get-Process | Where-Object {  $_.ProcessName -match 'ollama|llama'} | Select-Object Id, ProcessName                          

```
