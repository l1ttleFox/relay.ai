import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from './app.mjs';
import { createProvider } from './provider.mjs';

const headers = key => ({ Authorization: `Bearer ${key}` });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
async function setup(t, fetchImpl, instructionFetchImpl) {
  const request = createProvider({ fetchImpl });
  if (instructionFetchImpl) request.instruction = (...args) => instructionFetchImpl(...args);
  const app = createApp({ request });
  app.listen(0, '127.0.0.1'); await once(app, 'listening');
  t.after(async () => { app.closeAllConnections(); await new Promise(resolve => app.close(resolve)); });
  return `http://127.0.0.1:${app.address().port}`;
}

test('balance is read using the buyer key, preserves zero and refreshes each request', async t => {
  let balance = 10000;
  const base = await setup(t, async (url, options) => {
    assert.equal(url.href, 'https://ru.cheapvibecode.ru/v1/balance');
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Cookie, undefined);
    return json({ token_balance: options.headers.Authorization === 'Bearer key-a' ? balance : 0 });
  });
  const get = key => fetch(base + '/api/account', { headers: headers(key) });
  const response = await get('key-a');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).remainingTokens, 10000);
  balance = 9500;
  assert.equal((await (await get('key-a')).json()).remainingTokens, 9500);
  assert.equal((await (await get('key-b')).json()).remainingTokens, 0);
  assert.equal((await fetch(base + '/api/account')).status, 401);
});

test('GitHub Pages can call the API with buyer authorization', async t => {
  const base = await setup(t, async () => json({ token_balance: 10000 }));
  const origin = 'https://l1ttlefox.github.io';
  const preflight = await fetch(base + '/api/account', {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  assert.match(preflight.headers.get('access-control-allow-headers'), /Authorization/i);

  const response = await fetch(base + '/api/account', {
    headers: { ...headers('key-a'), Origin: origin },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);

  const denied = await fetch(base + '/api/account', {
    method: 'OPTIONS',
    headers: { Origin: 'https://example.org' },
  });
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.has('access-control-allow-origin'), false);
});

test('generation and history routes cannot invoke upstream', async t => {
  const base = await setup(t, async () => assert.fail('must not contact upstream'));
  for (const path of ['/v1/chat/completions', '/v1/responses', '/v1/messages', '/backend-api/codex', '/v1/balance', '/api/history']) {
    for (const method of ['GET', 'POST']) {
      const r = await fetch(base + path, { method, headers: headers('key-a') });
      assert.equal(r.status, 404, `${method} ${path}`);
    }
  }
  const r = await fetch(base + '/api/account', { method: 'POST', headers: headers('key-a') });
  assert.equal(r.status, 405); assert.equal(r.headers.get('allow'), 'GET');
});

test('documented installer routes are served through this backend', async t => {
  const base = await setup(t, async () => assert.fail('AI data endpoint must not be called'), async (url, signal, options) => {
    assert.equal(new URL(url, 'https://relay-ai-ami6.onrender.com').pathname, '/icw');
    assert.equal(options.Authorization, 'Bearer key-a');
    return new Response("iex(irm 'https://ru.cheapvibecode.ru/icm'); Invoke-RestMethod 'https://ru.cheapvibecode.ru/v1/models'", { headers: { 'Content-Type': 'text/plain' } });
  });
  const response = await fetch(base + '/icw', { headers: headers('key-a') });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "iex(irm 'https://relay-ai-ami6.onrender.com/icm'); Invoke-RestMethod 'https://ru.cheapvibecode.ru/v1/models'");
  assert.equal((await fetch(base + '/v1/chat/completions')).status, 404);
});

test('upstream errors are mapped without exposing upstream bodies', async t => {
  let status = 401;
  const base = await setup(t, async () => {
    if (status === 504) throw new DOMException('private timeout', 'TimeoutError');
    return json({ error: 'PRIVATE' }, status);
  });
  for (status of [401, 403, 429, 500, 504]) {
    const r = await fetch(base + '/api/account', { headers: headers('key-a') });
    assert.equal(r.status, status === 500 ? 502 : status);
    assert.equal((await r.text()).includes('PRIVATE'), false);
  }
});

test('malformed balance never becomes a successful empty or negative balance', async t => {
  let data = {};
  const base = await setup(t, async () => json(data));
  for (data of [{}, { token_balance: -1 }, { token_balance: false }]) {
    assert.equal((await fetch(base + '/api/account', { headers: headers('key-a') })).status, 502);
  }
});

test('catalog reads only models with buyer authorization', async t => {
  const base = await setup(t, async (url, options) => {
    assert.equal(url.pathname, '/v1/models');
    assert.equal(options.headers.Authorization, 'Bearer key-b');
    return json({ data: [{ id: 'example-model' }] });
  });
  const r = await fetch(base + '/api/models', { headers: headers('key-b') });
  assert.deepEqual(await r.json(), { data: [{ id: 'example-model' }] });
});

test('instructions are hosted locally while AI endpoints remain direct', async t => {
  const base = await setup(t, async () => assert.fail('public instructions must not contact upstream'));
  const r = await fetch(base + '/api/instructions');
  const data = await r.json();
  assert.equal(data.connectionMode, 'direct');
  assert.equal(data.baseUrl, 'https://ru.cheapvibecode.ru/v1');
  assert.equal(data.autoSynced, false);
  assert.equal(data.sourceUrl, undefined);
  assert.equal(data.sourceAsset, undefined);
  assert.equal(new Set(data.guides.map(g => g.id)).size, data.guides.length);
  for (const guide of data.guides) for (const example of guide.examples) {
    assert.equal(example.code.includes('localhost'), false);
    if (example.scriptUrl) assert.equal(new URL(example.scriptUrl).origin, 'https://relay-ai-ami6.onrender.com');
    if (guide.id === 'curl' || guide.id === 'python' || guide.id === 'javascript') {
      assert.equal(example.code.includes('https://ru.cheapvibecode.ru/v1/models'), false);
    } else {
      assert.equal(example.code.includes('cheapvibecode.ru'), false);
    }
  }
  const get = id => data.guides.find(g => g.id === id);
  assert.deepEqual(get('codex').os, ['Windows', 'macOS']);
  assert.ok(get('vscode').examples.find(e => e.os === 'Windows').code.includes('/iw'));
  assert.ok(get('codex-cli').examples.find(e => e.os === 'macOS').code.includes('/icm'));
  assert.ok(get('claude').examples[0].code.includes('-Headers $h'));
  assert.equal(get('cursor').modelFormat, 'MODEL_ID-cursor');
  assert.equal(get('opencode').modelFormat, 'cheapvibecode/MODEL_ID');
  assert.equal(get('python').source, 'local-example');
  assert.ok(get('python').examples[0].code.includes('base_url="https://ru.cheapvibecode.ru/v1"'));
  assert.equal(data.endpoints.models, 'https://relay-ai-ami6.onrender.com/api/models');
  assert.equal(data.endpoints.balance, 'https://relay-ai-ami6.onrender.com/api/account');
  assert.equal(data.endpoints.chat, 'https://ru.cheapvibecode.ru/v1/chat/completions');
});

test('adapter refuses unsupported routes and origins', async () => {
  assert.throws(() => createProvider({ origin: 'https://example.org' }));
  const request = createProvider({ fetchImpl: () => assert.fail('must not fetch') });
  for (const path of ['/v1/chat/completions', '/api/portal/me', 'https://example.org/v1/balance']) {
    await assert.rejects(request(path, 'key-a'));
  }
});
