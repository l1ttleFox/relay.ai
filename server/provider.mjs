export function normalizeBalance(data, field = 'balance') {
  const value = field.split('.').reduce((node, part) => node?.[part], data);
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0) {
    throw new Error('Неизвестный формат баланса. Настройте CVC_BALANCE_FIELD по ответу провайдера.');
  }
  // This field must represent the remaining key quota, never the parent balance.
  return { remainingTokens: Number(value), updatedAt: new Date().toISOString() };
}
export function createProvider({ origin = process.env.CVC_ORIGIN || 'https://ru.cheapvibecode.ru', fetchImpl = fetch } = {}) {
  const base = new URL(origin);
  if (!['https://ru.cheapvibecode.ru', 'https://cheapvibecode.ru'].includes(base.origin)) throw new Error('Недопустимый CVC_ORIGIN');
  return async (path, key, { signal, timeout = 15000 } = {}) => {
    if (!['/v1/balance', '/v1/models'].includes(path)) throw new Error('Endpoint не поддерживается в MVP');
    const url = new URL(path, base);
    if (url.origin !== base.origin) throw new Error('Endpoint должен принадлежать CheapVibeCode');
    return fetchImpl(url, {
      method: 'GET', headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      redirect: 'error', signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(timeout)]),
    });
  };
}

export function createInstructionProxy({ origin = process.env.CVC_ORIGIN || 'https://ru.cheapvibecode.ru', fetchImpl = fetch } = {}) {
  const base = new URL(origin);
  if (!['https://ru.cheapvibecode.ru', 'https://cheapvibecode.ru'].includes(base.origin)) throw new Error('Недопустимый CVC_ORIGIN');
  return async (path, signal, headers = {}) => fetchImpl(new URL(path, base), {
    method: 'GET', headers: { Accept: '*/*', ...headers }, redirect: 'error',
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  });
}

export async function readProvider(request, path, key, signal) {
  const response = await request(path, key, { signal });
  if (!response.ok) {
    await response.body?.cancel();
    const error = new Error(({ 401: 'Ключ не принят провайдером', 403: 'Нет доступа к данным ключа', 429: 'Лимит запросов. Попробуйте позже' })[response.status] || `Провайдер вернул HTTP ${response.status}`);
    error.status = [401, 403, 429].includes(response.status) ? response.status : 502;
    throw error;
  }
  return response.json();
}

export async function upstream(path, key, signal) {
  return readProvider(createProvider(), path, key, signal);
}
