// Snapshot of provider model data: token multipliers, modalities and 24 h uptime.
// Multipliers and modalities refreshed 2026-09-23 from the live /v1/models
// endpoint (buyer key). Uptime/requests/success stats still come from the
// owner-only snapshot captured 2026-09-12 — that endpoint requires the owner
// session, so buyers see this dated copy.
// multiplier = tokens charged per unit of work relative to x1.
export const snapshotAsOf = '2026-09-23';

export const modelSnapshot = {
  'claude-fable-5-1': {"multiplier":8,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99013,"requests":3952,"success":3913,"providerClass":"claude"},
  'claude-fable-5': {"multiplier":8,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99674,"requests":6441,"success":6420,"providerClass":"claude"},
  'claude-opus-5': {"multiplier":4,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99561,"requests":20269,"success":20180,"providerClass":"claude"},
  'claude-opus-4-8': {"multiplier":4,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99654,"requests":2601,"success":2592,"providerClass":"claude"},
  'claude-opus-4-7': {"multiplier":4,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":1,"requests":865,"success":865,"providerClass":"claude"},
  'claude-opus-4-6': {"multiplier":4,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99583,"requests":2641,"success":2630,"providerClass":"claude"},
  'claude-sonnet-5': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99874,"requests":27774,"success":27739,"providerClass":"claude"},
  'claude-sonnet-4-6': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99856,"requests":15249,"success":15227,"providerClass":"claude"},
  'claude-haiku-4-5': {"multiplier":0.9,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99906,"requests":25498,"success":25474,"providerClass":"claude"},
  'gpt-6-astra': {"multiplier":7.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.97719,"requests":83390,"success":81488},
  'gpt-5.6-sol': {"multiplier":3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.98098,"requests":72833,"success":71448},
  'gpt-5.5': {"multiplier":3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.97403,"requests":3927,"success":3825},
  'qwen3.8-max': {"multiplier":2.5,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"],"uptime":0.99714,"requests":1747,"success":1742},
  'kimi-k3': {"multiplier":2.5,"cachedDiscount":1,"vision":true,"input":["text","image","video","pdf"],"output":["text"],"uptime":0.99293,"requests":16418,"success":16302},
  'gpt-6-sol': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'gemini-3.1-pro': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":1,"requests":2131,"success":2131},
  'gemini-3.6-flash': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":1,"requests":28101,"success":28101},
  'gemini-3.7-flash': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":0.99994,"requests":15950,"success":15949},
  'gemini-3.8-flash': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":1,"requests":9439,"success":9439},
  'glm-5.2': {"multiplier":1.5,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":1,"requests":1342,"success":1342},
  'glm-5.3': {"multiplier":1.5,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.99959,"requests":9677,"success":9673},
  'gpt-5.6-terra': {"multiplier":1.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.9823,"requests":88351,"success":86787},
  'glm-5-turbo': {"multiplier":1,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.99506,"requests":405,"success":403},
  'hy4-preview': {"multiplier":1,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.96593,"requests":998,"success":964},
  'kimi-k2.7-code': {"multiplier":0.9,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"],"uptime":0.99978,"requests":4596,"success":4595},
  'qwen3.8-flash': {"multiplier":0.7,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"],"uptime":0.99252,"requests":802,"success":796},
  'deepseek-v4-pro': {"multiplier":0.5,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.99973,"requests":18527,"success":18522},
  'grok-4.5': {"multiplier":0.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99796,"requests":981,"success":979},
  'grok-4.6': {"multiplier":0.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99945,"requests":10959,"success":10953},
  'grok-4.7': {"multiplier":0.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'gpt-5.6-luna': {"multiplier":0.33,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.9896,"requests":95148,"success":94158},
  'composer-2.5-fast': {"multiplier":0.3,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":1,"requests":549,"success":549},
  'deepseek-v4.1-flash': {"multiplier":0.3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.98328,"requests":8554,"success":8411},
  'glm-5.3-flash': {"multiplier":0.3,"cachedDiscount":1,"vision":true,"input":["text","image","video","pdf"],"output":["text"],"uptime":0.99952,"requests":39678,"success":39659},
  'mimo-v2.5-pro': {"multiplier":0.3,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.99862,"requests":2900,"success":2896},
  'minimax-m3': {"multiplier":0.3,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"],"uptime":1,"requests":22936,"success":22936},
  'gpt-6-luna': {"multiplier":0.25,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'deepseek-v4-flash': {"multiplier":0.1,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.99988,"requests":72713,"success":72704},
  'mimo-v2.5': {"multiplier":0.05,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video"],"output":["text"],"uptime":0.98616,"requests":1662,"success":1639},
  'gpt-image-2': {"standalone":true,"uptime":0.91977,"requests":5297,"success":4872},
  'gpt-image-2.5-flare': {"standalone":true},
  'gpt-image-2.5-sunburst': {"standalone":true},
  'nano-banana-2': {"standalone":true,"providerClass":"google"},
  'grok-imagine-image': {"standalone":true,"uptime":0.97059,"requests":34,"success":33},
  'grok-imagine-video': {"standalone":true,"uptime":0.2,"requests":10,"success":2},
  'gpt-4o-transcribe': {"multiplier":1,"standalone":true},
  'codex-auto-review': {"uptime":1,"requests":579,"success":579},
  'web_search': {"uptime":0.95082,"requests":122,"success":116},
  'codex-transcribe': {"uptime":1,"requests":17,"success":17},
};

/** Lookup for a model ID; tolerates provider prefixes like "openai/gpt-5.5". */
export function modelInfo(id) {
  const raw = String(id ?? '').trim();
  const bare = raw.includes('/') ? raw.split('/').pop() : raw;
  return modelSnapshot[raw] ?? modelSnapshot[bare] ?? null;
}
