import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowRight, Eye, KeyRound, RefreshCw, Search, ShieldCheck, X, Zap } from 'lucide-react';
import { loadModels, useResource } from './hooks';
import { modelInfo, multiplierStyle, uptimeTier } from './modelScale';
import { modelSnapshot, snapshotAsOf } from './modelData';
import { ErrorBlock, LoadingBlock, PurchaseButton, PurchaseLinks } from './components';
import { useToast } from './Toast';
import { useI18n } from './i18n';

const fmtUptime = (value, locale) => (value == null
  ? '—'
  : new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value));

function modelProvider(model) {
  const info = modelInfo(model?.id);
  if (info?.providerClass) return info.providerClass;
  const id = String(model?.id ?? '');
  if (id.includes('/')) return id.split('/')[0];
  for (const vendor of ['gpt', 'o1', 'o3', 'o4', 'chatgpt']) if (id.startsWith(vendor)) return 'openai';
  if (id.startsWith('claude')) return 'anthropic';
  if (id.startsWith('gemini')) return 'google';
  if (id.startsWith('grok')) return 'xai';
  if (id.startsWith('deepseek')) return 'deepseek';
  if (id.startsWith('kimi')) return 'moonshot';
  return model?.owned_by || '—';
}

function MultiplierBadge({ value, big = false }) {
  const { nf } = useI18n();
  const style = multiplierStyle(value);
  return <span
    className={`model-mult ${value == null ? 'is-unknown' : ''} ${big ? 'is-big' : ''}`}
    style={style ?? undefined}
  >
    {value == null ? '—' : `×${nf.format(value)}`}
  </span>;
}

function UptimeBadge({ value }) {
  const tier = uptimeTier(value);
  return <span className={`uptime-badge is-${tier}`}>
    <Activity size={13} aria-hidden="true" />
    {value == null ? '—' : fmtUptime(value, 'en-US')}
  </span>;
}

function formatTokens(value) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function MediaPricing({ pricing }) {
  if (!pricing) return null;
  if (pricing.kind === 'video') return <div className="detail-cell detail-wide media-pricing">
    <span className="mono-label">Списание · за секунду</span>
    <div className="media-price-list">
      {pricing.rates.map(([label, value]) => <div className="media-price-row" key={label}>
        <span>{label}</span><b>{formatTokens(value)} токенов</b>
      </div>)}
    </div>
    {pricing.note && <span className="media-price-note">{pricing.note}</span>}
  </div>;
  return <div className="detail-cell detail-wide media-pricing">
    <span className="mono-label">Списание · за изображение</span>
    <div className="media-price-list">
      {pricing.tiers.map(([label, value]) => <div className="media-price-row" key={label}>
        <span>{label}</span><b>{formatTokens(value)} токенов</b>
      </div>)}
    </div>
    <span className="media-price-note">Количество: {pricing.counts.join(', ')}. Итоговая стоимость умножается на количество изображений.</span>
    {pricing.note && <span className="media-price-note">{pricing.note}</span>}
  </div>;
}

/* ---------------- Баланс ---------------- */
export function BalanceView({ apiKey, accountResource, onOpenKeyDialog, onGoInstructions }) {
  const resource = accountResource;
  const { t, nf, dtf, translateError } = useI18n();

  if (!apiKey) {
    return <div className="view">
      <div className="page-head">
        <div>
          <span className="mono-label">{t('balance.kicker')}</span>
          <h1>{t('balance.titleA')} <em>{t('balance.titleB')}</em></h1>
          <p>{t('balance.desc')}</p>
        </div>
      </div>
      <div className="empty-card glass">
        <h2>{t('balance.noKey.title')}</h2>
        <p>{t('balance.noKey.text')}</p>
        <button className="btn-primary" style={{ maxWidth: 320, margin: '0 auto' }} onClick={onOpenKeyDialog}>
          <KeyRound size={17} /> {t('balance.connect')}
        </button>
        <PurchaseLinks />
      </div>
    </div>;
  }

  const updated = resource.data?.updatedAt ? dtf.format(new Date(resource.data.updatedAt)) : null;
  return <div className="view">
    <div className="page-head">
      <div>
        <span className="mono-label">{t('balance.kicker')}</span>
        <h1>{t('balance.titleA')} <em>{t('balance.titleB')}</em></h1>
        <p>{t('balance.desc')}</p>
      </div>
      <span className={`refresh-state ${resource.data && !resource.error ? 'is-live' : ''}`}>
        <span className="dot" />
        {resource.loading && !resource.data
          ? t('balance.requesting')
          : updated ? t('balance.updated', { time: updated }) : t('balance.autoRefresh')}
      </span>
    </div>
    <div className="balance-hero glass">
      <span className="corner-tag">Relay AI</span>
      <span className="corner-sub">token balance · live</span>
      <span className="mono-label">{t('balance.heroLabel')}</span>
      {!resource.data && resource.loading && <LoadingBlock label={t('balance.loading')} />}
      {!resource.data && resource.error && <div style={{ marginTop: 24 }}><ErrorBlock message={translateError(resource.error)} /></div>}
      {resource.data && <>
        <p className={`balance-value ${resource.loading ? 'is-loading' : ''}`}>{nf.format(resource.data.remainingTokens)}</p>
        <p className="balance-unit">{t('balance.unit')}</p>
        {resource.data.remainingTokens < 100000 && <p className="balance-note balance-low">{t('balance.low')}</p>}
        {resource.error && <p className="balance-note is-error" role="alert">{t('balance.staleError', { error: translateError(resource.error) })}</p>}
        <div className="balance-row">
          <PurchaseButton />
          <button className="btn-ghost" onClick={resource.refresh} disabled={resource.loading}>
            <RefreshCw size={15} /> {t('balance.refresh')}
          </button>
          <button className="btn-ghost" onClick={onGoInstructions}>
            {t('balance.setupClient')} <ArrowRight size={15} />
          </button>
        </div>
      </>}
    </div>
  </div>;
}

/* ---------------- Детали модели ---------------- */
function ModelDialog({ model, onClose }) {
  const ref = useRef(null);
  const { t, nf, locale } = useI18n();
  useEffect(() => {
    if (!ref.current) return;
    if (model) ref.current.showModal();
    else ref.current.close();
  }, [model]);
  if (!model) return <dialog ref={ref} className="model-dialog" onClose={onClose} />;

  const id = String(model.id ?? '');
  const info = modelInfo(id);
  const modality = name => t(`modality.${name}`) || name;
  const snapshotDate = new Date(`${snapshotAsOf}T00:00:00`).toLocaleDateString(locale);

  return <dialog ref={ref} className="model-dialog" aria-label={id}
    onClose={onClose}
    onClick={e => { if (e.target === ref.current) onClose(); }}>
    <div className="model-dialog-body">
      <header>
        <span className="model-glyph" aria-hidden="true">{id.slice(0, 2).toUpperCase()}</span>
        <div style={{ minWidth: 0 }}>
          <span className="mono-label">{t('detail.title')} · {modelProvider(model)}</span>
          <h2>{id}</h2>
        </div>
        <button className="dialog-x" onClick={onClose} aria-label={t('detail.close')}><X size={17} /></button>
      </header>

      {!info && <p className="detail-missing">{t('detail.notInSnapshot')}</p>}

      {info && <div className="detail-grid">
        <MediaPricing pricing={info.mediaPricing} />
        {info.multiplier != null && <div className="detail-cell">
          <span className="mono-label">{t('detail.multiplier')}</span>
          <MultiplierBadge value={info.multiplier} big />
        </div>}
        {info.uptime != null && <div className="detail-cell">
          <span className="mono-label">{t('detail.uptime')}</span>
          <UptimeBadge value={info.uptime} />
        </div>}
        {info.requests != null && <div className="detail-cell">
          <span className="mono-label">{t('detail.requests')}</span>
          <b className="detail-num">{nf.format(info.requests)}</b>
        </div>}
        {info.success != null && <div className="detail-cell">
          <span className="mono-label">{t('detail.success')}</span>
          <b className="detail-num">{nf.format(info.success)}</b>
        </div>}
        {info.input && <div className="detail-cell">
          <span className="mono-label">{t('detail.input')}</span>
          <span className="detail-chips">{info.input.map(m => <span className="detail-chip" key={m}>{modality(m)}</span>)}</span>
        </div>}
        {info.output && <div className="detail-cell">
          <span className="mono-label">{t('detail.output')}</span>
          <span className="detail-chips">{info.output.map(m => <span className="detail-chip" key={m}>{modality(m)}</span>)}</span>
        </div>}
        {info.vision != null && <div className="detail-cell">
          <span className="mono-label">{t('detail.vision')}</span>
          <span className="detail-bool">
            {info.vision ? <><Eye size={15} /> {t('detail.yes')}</> : t('detail.no')}
          </span>
        </div>}
        {info.standalone && <div className="detail-cell detail-wide">
          <span className="detail-standalone">{t('detail.standalone')}</span>
        </div>}
      </div>}

      <footer>
        <span className="mono-label">{t('detail.snapshot', { date: snapshotDate })}</span>
      </footer>
    </div>
  </dialog>;
}

/* ---------------- Модели ---------------- */
export function ModelsView({ apiKey, onOpenKeyDialog }) {
  const resource = useResource(loadModels, apiKey);
  const [query, setQuery] = useState('');
  const [details, setDetails] = useState(null);
  const toast = useToast();
  const { t, locale, translateError } = useI18n();

  const publicModels = useMemo(
    () => Object.keys(modelSnapshot).map(id => ({ id })),
    [],
  );
  const models = useMemo(() => {
    const list = apiKey
      ? (Array.isArray(resource.data?.data) ? resource.data.data : [])
      : publicModels;
    const q = query.trim().toLowerCase();
    return q ? list.filter(m => String(m.id).toLowerCase().includes(q)) : list;
  }, [apiKey, publicModels, resource.data, query]);

  async function copyId(id) {
    try {
      await navigator.clipboard.writeText(id);
      toast(t('models.copied'));
    } catch {
      toast(t('models.copyFail'), true);
    }
  }

  const snapshotDate = new Date(`${snapshotAsOf}T00:00:00`).toLocaleDateString(locale);
  return <div className="view">
    <div className="page-head">
      <div>
        <span className="mono-label">{t('models.kicker')}</span>
        <h1>{t('models.titleA')} <em>{t('models.titleB')}</em></h1>
        <p>{t(apiKey ? 'models.desc' : 'models.publicDesc')}</p>
      </div>
      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('models.search')} aria-label={t('models.search')} />
      </label>
    </div>
    {!apiKey && <div className="public-catalog-note glass">
      <div>
        <span className="mono-label">{t('models.publicLabel')}</span>
        <p>{t('models.publicNote')}</p>
      </div>
      <div className="public-catalog-actions">
        <PurchaseButton />
        <button className="btn-ghost" onClick={onOpenKeyDialog}><KeyRound size={15} /> {t('balance.connect')}</button>
      </div>
    </div>}
    {apiKey && resource.loading && !resource.data && <LoadingBlock label={t('models.loading')} />}
    {apiKey && resource.error && !resource.data && <ErrorBlock message={translateError(resource.error)} />}
    {(resource.data || !apiKey) && <div className="model-table glass">
      <div className="model-thead" aria-hidden="true">
        <span>{t('models.col.model')}</span>
        <span>{t('models.col.provider')}</span>
        <span>{t('models.col.multiplier')}</span>
        <span>{t('models.col.uptime')}</span>
        <span style={{ justifySelf: 'end' }}>{t('models.col.action')}</span>
      </div>
      {models.length === 0 && <p className="table-empty">{t('models.none')}{query ? t('models.noneQuery') : ''}.</p>}
      {models.map(model => {
        const id = String(model.id ?? '');
        const info = modelInfo(id);
        return <div className="model-trow" key={id} role="button" tabIndex={0} title={t('models.rowHint')}
          onClick={() => setDetails(model)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetails(model); } }}>
          <span className="model-id">
            <span className="model-glyph" aria-hidden="true">{id.slice(0, 2).toUpperCase()}</span>
            <code title={id}>{id}</code>
          </span>
          <span className="model-meta">{modelProvider(model)}</span>
          <MultiplierBadge value={info?.multiplier} />
          <UptimeBadge value={info?.uptime} />
          <button className="model-copy" onClick={e => { e.stopPropagation(); copyId(id); }}>{t('models.copy')}</button>
        </div>;
      })}
    </div>}
    {(resource.data || !apiKey) && <p className="pricing-note">{t(apiKey ? 'models.pricingNote' : 'models.publicPricingNote', { date: snapshotDate })}</p>}
    {resource.error && resource.data && <p className="balance-note is-error" role="alert" style={{ textAlign: 'center', marginTop: 18 }}>{t('balance.staleError', { error: translateError(resource.error) })}</p>}
    <ModelDialog model={details} onClose={() => setDetails(null)} />
  </div>;
}

/* ---------------- FAQ ---------------- */
function faqItems(lang) {
  if (lang === 'en') return [
    {
      q: 'How are token deductions calculated?',
      a: <>
        <p>The provider counts the tokens of every request — input, output and internal reasoning — and multiplies that amount by the model multiplier shown in the catalog. The result is deducted from your balance.</p>
        <p>Example: a request to a <code>×2</code> model that produces 10 000 tokens of work deducts 20 000 tokens from the balance. The same request to a <code>×0.1</code> model costs only 1 000 tokens. Cached input tokens can be billed at a lower rate depending on the model.</p>
        <p>The balance is a token quota. Multipliers in the catalog are a dated snapshot of provider pricing.</p>
      </>,
    },
    {
      q: 'What does the token balance show?',
      a: <p>It is the remaining quota of your API key. Every model request deducts tokens according to the model multiplier. The cabinet refreshes the balance every 60 seconds.</p>,
    },
    {
      q: 'Where is my API key stored?',
      a: <p>In the current browser tab only. The key is written to the tab’s storage so it survives page reloads, but it is never sent to our server for storage and disappears when you close the tab. The server uses it only as an <code>Authorization: Bearer</code> header for balance and catalog requests to the provider.</p>,
    },
    {
      q: 'What does “Key not accepted by the provider” mean?',
      a: <p>Check that the key was copied fully and without spaces. If it is definitely correct, it may have been revoked or expired — contact the seller you bought it from for a replacement.</p>,
    },
    {
      q: 'How do I update or remove the key?',
      a: <p>Click the key button in the top right corner. In the dialog you can enter a new key or remove the current one — the balance and live model catalog stop loading, and the instructions show a general overview without commands.</p>,
    },
  ];
  return [
    {
      q: 'Как рассчитывается списание токенов?',
      a: <>
        <p>Провайдер считает токены каждого запроса — входные, выходные и внутренние рассуждения модели — и умножает их количество на множитель модели из каталога. Результат списывается с вашего баланса.</p>
        <p>Пример: запрос к модели с множителем <code>×2</code>, в котором выполнено 10 000 токенов работы, спишет с баланса 20 000 токенов. Тот же запрос к модели <code>×0.1</code> обойдётся всего в 1 000 токенов. Кэшированные входные токены у части моделей тарифицируются дешевле.</p>
        <p>Баланс — это квота токенов. Множители в каталоге — датированный снимок тарифов провайдера.</p>
      </>,
    },
    {
      q: 'Что показывает остаток токенов?',
      a: <p>Это остаток квоты вашего API-ключа. Каждый запрос к модели списывает токены согласно множителю модели. Кабинет обновляет остаток каждые 60 секунд.</p>,
    },
    {
      q: 'Где хранится мой API-ключ?',
      a: <p>Только в текущей вкладке браузера. Ключ записывается в хранилище вкладки, чтобы переживать перезагрузку страницы, но не попадает на наш сервер для хранения и исчезает после закрытия вкладки. Сервер использует его исключительно как заголовок <code>Authorization: Bearer</code> для запросов баланса и каталога моделей к провайдеру.</p>,
    },
    {
      q: 'Что делать при ошибке «Ключ не принят провайдером»?',
      a: <p>Проверьте, что ключ скопирован полностью и без пробелов. Если ключ точно верный — возможно, он был отозван или истёк. Обратитесь к продавцу, у которого покупали ключ, для замены.</p>,
    },
    {
      q: 'Как обновить или удалить ключ в кабинете?',
      a: <p>Нажмите на кнопку ключа в правом верхнем углу. В диалоге можно ввести новый ключ или удалить текущий — остаток и живой каталог моделей перестанут загружаться, а в инструкциях останется общий обзор без команд.</p>,
    },
  ];
}

export function FaqView() {
  const { t, lang } = useI18n();
  const items = faqItems(lang);
  const quick = lang === 'en'
    ? {
      q: 'How do I set up my first client?',
      body: <p>Open “Instructions”, pick your OS and a client — for example Codex or Claude Code. Connect a key to see ready-to-run commands.</p>,
      badge1: 'No key storage',
      badge2: 'Direct connection to the provider',
    }
    : {
      q: 'Как быстро настроить первый клиент?',
      body: <p>Откройте раздел «Инструкции», выберите свою ОС и клиент — например Codex или Claude Code. Подключите ключ, чтобы получить готовые команды.</p>,
      badge1: 'Без хранения ключей',
      badge2: 'Прямое подключение к провайдеру',
    };
  return <div className="view">
    <div className="page-head">
      <div>
        <span className="mono-label">{t('faq.kicker')}</span>
        <h1>{t('faq.titleA')} <em>{t('faq.titleB')}</em></h1>
        <p>{t('faq.desc')}</p>
      </div>
    </div>
    <div className="faq-grid">
      <article className="faq-card glass">
        <h2>{t('balance.buy')}</h2>
        <PurchaseLinks />
      </article>
      {items.map((item, i) => <article className="faq-card glass" key={item.q}>
        <h2><span className="faq-num">0{i + 1}</span>{item.q}</h2>
        <div className="body">{item.a}</div>
      </article>)}
      <article className="faq-card glass">
        <h2><span className="faq-num">0{items.length + 1}</span>{quick.q}</h2>
        <div className="body">
          {quick.body}
          <p style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><ShieldCheck size={15} /> {quick.badge1}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Zap size={15} /> {quick.badge2}</span>
          </p>
        </div>
      </article>
    </div>
  </div>;
}
