// Snapshot of the provider catalog: token multipliers, modalities and 24 h uptime.
// Multipliers were refreshed from the supplied provider price list on 2026-11-06.
// Uptime/requests/success stats are retained only where the older owner snapshot
// had a matching model; new models have no local uptime statistics yet.
// multiplier = tokens charged per unit of work relative to x1.
export const snapshotAsOf = '2026-11-06';

export const modelSnapshot = {
  'gpt-6-astra': {"multiplier":8,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.97719,"requests":83390,"success":81488},
  'gpt-6.1-sol': {"multiplier":2.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'gpt-6.1-terra': {"multiplier":1,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'gpt-6-sol': {"multiplier":2.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'gpt-6-luna': {"multiplier":0.3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'gpt-5.6-sol': {"multiplier":4,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.98098,"requests":72833,"success":71448},
  'gpt-5.6-terra': {"multiplier":1.3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.9823,"requests":88351,"success":86787},
  'gpt-5.6-luna': {"multiplier":0.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.9896,"requests":95148,"success":94158},

  'claude-fable-5-1': {"multiplier":12,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99013,"requests":3952,"success":3913,"providerClass":"claude"},
  'claude-fable-5': {"multiplier":12,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99674,"requests":6441,"success":6420,"providerClass":"claude"},
  'claude-opus-5-5': {"multiplier":6,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"providerClass":"claude"},
  'claude-opus-5': {"multiplier":6,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99561,"requests":20269,"success":20180,"providerClass":"claude"},
  'claude-opus-4-8': {"multiplier":6,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99654,"requests":2601,"success":2592,"providerClass":"claude"},
  'claude-opus-4-7': {"multiplier":6,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":1,"requests":865,"success":865,"providerClass":"claude"},
  'claude-opus-4-6': {"multiplier":6,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99583,"requests":2641,"success":2630,"providerClass":"claude"},
  'claude-sonnet-5-5': {"multiplier":3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"providerClass":"claude"},
  'claude-sonnet-5': {"multiplier":3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99874,"requests":27774,"success":27739,"providerClass":"claude"},
  'claude-sonnet-4-6': {"multiplier":3,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99856,"requests":15249,"success":15227,"providerClass":"claude"},
  'claude-haiku-5-5': {"multiplier":0.9,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"providerClass":"claude"},
  'claude-haiku-4-5': {"multiplier":0.9,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99906,"requests":25498,"success":25474,"providerClass":"claude"},

  'gemini-3.8-flash': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":1,"requests":9439,"success":9439},
  'gemini-3.7-flash': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":0.99994,"requests":15950,"success":15949},
  'gemini-3.6-flash': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":1,"requests":28101,"success":28101},
  'gemini-3.1-pro': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","audio","video","pdf"],"output":["text"],"uptime":1,"requests":2131,"success":2131},

  'grok-4.6': {"multiplier":0.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99945,"requests":10959,"success":10953},
  'grok-4.5': {"multiplier":0.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"],"uptime":0.99796,"requests":981,"success":979},
  'grok-4.7': {"multiplier":0.5,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},

  'deepseek-v4.1-flash-1017': {"multiplier":0.1,"cachedDiscount":1,"vision":true,"input":["text","image"],"output":["text"]},
  'kimi-k3.1-pro': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","video","pdf"],"output":["text"]},
  'minimax-m3.1-flash': {"multiplier":0.1,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"]},
  'kimi-k3': {"multiplier":2.5,"cachedDiscount":1,"vision":true,"input":["text","image","video","pdf"],"output":["text"],"uptime":0.99293,"requests":16418,"success":16302},
  'glm-5.3': {"multiplier":1.5,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.99959,"requests":9677,"success":9673},
  'mimo-v2.6-pro': {"multiplier":0.3,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},
  'mimo-v2.6-flash': {"multiplier":0.1,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},
  'glm-5.3-flash': {"multiplier":0.3,"cachedDiscount":1,"vision":true,"input":["text","image","video","pdf"],"output":["text"],"uptime":0.99952,"requests":39678,"success":39659},
  'hy4': {"multiplier":0.001,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},
  'qwen3.8-flash': {"multiplier":0.7,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"],"uptime":0.99252,"requests":802,"success":796},
  'deepseek-v4-flash-0731': {"multiplier":0.1,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},
  'deepseek-v4-pro-0813': {"multiplier":0.5,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},
  'qwen3.8-max': {"multiplier":2,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"],"uptime":0.99714,"requests":1747,"success":1742},
  'glm-5.2': {"multiplier":1.5,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":1,"requests":1342,"success":1342},
  'glm-5-turbo': {"multiplier":1,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"],"uptime":0.99506,"requests":405,"success":403},
  'kimi-k2.8-preview': {"multiplier":0.9,"cachedDiscount":1,"vision":true,"input":["text","image","video"],"output":["text"]},
  'nemotron-3.5-super-v1': {"multiplier":0.001,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},
  'nemotron-3-ultra': {"multiplier":0.001,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},
  'nemotron-3.5-lightning': {"multiplier":0.001,"cachedDiscount":1,"vision":false,"input":["text"],"output":["text"]},

  'gpt-image-2': {"standalone":true,"mediaPricing":{"kind":"image","unit":"image","tiers":[["low",50000],["medium",100000],["high",150000]],"counts":[1,2,4]},"uptime":0.91977,"requests":5297,"success":4872},
  'gpt-image-2.5-flare': {"standalone":true,"mediaPricing":{"kind":"image","unit":"image","tiers":[["low",50000],["medium",100000],["high",150000]],"counts":[1,2,4]}},
  'gpt-image-2.5-sunburst': {"standalone":true,"mediaPricing":{"kind":"image","unit":"image","tiers":[["low",50000],["medium",100000],["high",150000]],"counts":[1,2,4]}},
  'gpt-image-2.6-flare': {"standalone":true,"mediaPricing":{"kind":"image","unit":"image","tiers":[["low",50000],["medium",100000],["high",150000]],"counts":[1,2,4]}},
  'gpt-image-2.6-sunburst': {"standalone":true,"mediaPricing":{"kind":"image","unit":"image","tiers":[["low",50000],["medium",100000],["high",150000]],"counts":[1,2,4]}},
  'gpt-4o-transcribe': {"multiplier":1,"standalone":true},
  'kling-video-v3': {"standalone":true,"mediaPricing":{"kind":"video","rates":[["video",250000]],"unit":"second"}},
  'minimax-video-h3': {"standalone":true,"mediaPricing":{"kind":"video","rates":[["video",250000]],"unit":"second"}},
};

/** Lookup for a model ID; tolerates provider prefixes like "openai/gpt-5.5". */
export function modelInfo(id) {
  const raw = String(id ?? '').trim();
  const bare = raw.includes('/') ? raw.split('/').pop() : raw;
  return modelSnapshot[raw] ?? modelSnapshot[bare] ?? null;
}
