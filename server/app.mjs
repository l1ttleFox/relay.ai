import { createServer } from 'node:http';
import { normalizeBalance, readProvider } from './provider.mjs';
import { instructionCatalog, instructionProxyPaths } from './instructions.mjs';

const send = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};

const allowedOrigins = new Set([
  'https://l1ttlefox.github.io',
]);

// Rewrite only links to the proxied instruction scripts themselves. Direct API
// URLs (/v1, /backend-api) and bare API roots must keep pointing at the
// upstream: generation traffic is direct by design (connectionMode: 'direct'),
// and this backend intentionally does not serve those routes.
function proxyInstructionLinks(body, publicOrigin) {
  const publicRoot = publicOrigin.replace(/\/$/, '');
  return body.replace(/https:\/\/(?:ru\.)?cheapvibecode\.ru(\/[^\s"'`)\]<>]*)?/g, (match, tail = '') => {
    const pathname = tail.split(/[?#]/)[0];
    return instructionProxyPaths.has(pathname) ? publicRoot + tail : match;
  });
}

// Kimi Code imports its provider from the upstream /kimi-models registry, so the
// provider id there is server-controlled: renaming it in the script would break
// the post-import checks. Only display names are rebranded on these routes.
const kimiIdRoutes = new Set(['/ikw', '/ikm', '/ikl', '/rkw', '/rkm', '/rkl']);

// White-label the proxied instructions: the provider must appear as Relay AI
// while every API URL keeps pointing at the upstream host. The id rewrite
// therefore skips hostnames (*.cheapvibecode.ru), the URL-testing regex literal
// /cheapvibecode/i, and the legacy Grok model names that uninstallers must
// still recognize. Header name and camelCase identifier are rewritten first so
// the display-name rule cannot inject a space into them. State file names and
// backup prefixes are rewritten together with the installers that create them,
// so paired install/uninstall scripts stay consistent.
//
// Environment variables stay as CVC_*: the install, uninstall and uc scripts are
// separate stateless documents and share these names as an interface (the user's
// $env:CVC_API_KEY is read by every installer). The rewrite rules below match
// only the CheapVibeCode spellings, so CVC_* names pass through untouched.
function rebrandProvider(body, pathname) {
  const out = body
    .replaceAll('X-CheapVibeCode-Client', 'X-RelayAI-Client')
    .replaceAll('isCheapVibeCodeBaseURL', 'isRelayAiBaseURL')
    .replaceAll('CheapVibeCode', 'Relay AI');
  return kimiIdRoutes.has(pathname)
    ? out
    : out.replace(/cheapvibecode(?!\.ru|\/i\b|-grok\b|-composer\b)/g, 'relayai');
}

export function createApp({ request }) {
  const publicOrigin = process.env.PUBLIC_ORIGIN || 'https://relay-ai-ami6.onrender.com';
  const instructions = instructionCatalog({ publicOrigin });
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const origin = req.headers.origin;
    if (allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      if (!allowedOrigins.has(origin)) return send(res, 403, { error: 'Origin не разрешён' });
      res.writeHead(204);
      return res.end();
    }
    const controller = new AbortController();
    res.on('close', () => { if (!res.writableFinished) controller.abort(); });
    try {
      const { pathname: path } = new URL(req.url, 'http://localhost');
      const isInstructionProxy = instructionProxyPaths.has(path);
      if (!['/api/account', '/api/instructions', '/api/models'].includes(path) && !isInstructionProxy) return send(res, 404, { error: 'Endpoint не найден' });
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return send(res, 405, { error: 'Разрешён только GET' });
      }
      if (isInstructionProxy) {
        if (!request.instruction) return send(res, 404, { error: 'Endpoint не найден' });
        const upstream = await request.instruction(req.url, controller.signal, {
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        });
        res.writeHead(upstream.status, {
          'Content-Type': upstream.headers.get('content-type') || 'text/plain; charset=utf-8',
        });
        const body = await upstream.text();
        return res.end(rebrandProvider(proxyInstructionLinks(body, publicOrigin), path));
      }
      if (path === '/api/instructions') return send(res, 200, instructions);
      const key = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
      if (!key || key.length > 512) return send(res, 401, { error: 'Введите API-ключ' });
      if (path === '/api/models') return send(res, 200, await readProvider(request, '/v1/models', key, controller.signal));
      const data = await readProvider(request, '/v1/balance', key, controller.signal);
      send(res, 200, normalizeBalance(data, 'token_balance'));
    } catch (error) {
      if (!res.destroyed && !res.headersSent) send(res, error.status || (error.name === 'TimeoutError' ? 504 : 502), { error: error.status ? error.message : 'Не удалось получить данные провайдера' });
      else if (!res.destroyed) res.destroy();
    }
  });
}
