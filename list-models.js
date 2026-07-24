"use strict";
async function listInstalledModels() {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
        throw new Error(`Ollama is unavailable: ${response.status}`);
    }
    const data = (await response.json());
    console.table(data.models.map((model) => ({
        name: model.name,
        sizeGB: (model.size / 1024 ** 3).toFixed(2),
        modifiedAt: model.modified_at,
    })));
}
listInstalledModels().catch(console.error);
