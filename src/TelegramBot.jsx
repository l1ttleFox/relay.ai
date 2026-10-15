import React from 'react';
import { ArrowUpRight, Send } from 'lucide-react';
import { useI18n } from './i18n';

const botUrl = 'https://t.me/q2q2aibot';

function telegramUrl(apiKey, replaceKey = false) {
  const key = apiKey?.trim();
  return key ? `${botUrl}?start=${replaceKey ? 'setkey_' : ''}${encodeURIComponent(key)}` : botUrl;
}

export function TelegramLink({ apiKey, replaceKey = false, className = 'btn-ghost' }) {
  const { t } = useI18n();
  return <a className={`telegram-link ${className}`} href={telegramUrl(apiKey, replaceKey)} target="_blank" rel="noopener noreferrer">
    <Send size={16} aria-hidden="true" />
    {t(replaceKey ? 'telegram.replaceKey' : 'telegram.open')}
    <ArrowUpRight size={14} aria-hidden="true" />
  </a>;
}

export function TelegramBanner({ apiKey }) {
  const { t } = useI18n();
  return <aside className="telegram-banner glass" aria-label={t('telegram.title')}>
    <div>
      <h2>{t('telegram.title')} <span>@q2q2aibot</span></h2>
      <p>{t(apiKey ? 'telegram.bannerKey' : 'telegram.bannerNoKey')}</p>
    </div>
    <TelegramLink apiKey={apiKey} />
  </aside>;
}

export function TelegramGuide({ apiKey }) {
  const { t } = useI18n();
  return <div className="telegram-guide">
    <p className="telegram-description">{t('telegram.description')}</p>
    <p className="section-label">{t('telegram.features')}</p>
    <ul className="telegram-features">
      {['full', 'memory', 'media', 'audio', 'context'].map(feature => <li key={feature}>{t(`telegram.feature.${feature}`)}</li>)}
    </ul>
    <p className="section-label">{t('instructions.steps')}</p>
    <ol className="steps-list">
      <li>{t(apiKey ? 'telegram.step.openKey' : 'telegram.step.openNoKey')}</li>
      <li>{t('telegram.step.start')}</li>
      {!apiKey && <li>{t('telegram.step.key')}</li>}
      <li>{t('telegram.step.chat')}</li>
    </ol>
    <div className="telegram-actions">
      <TelegramLink apiKey={apiKey} />
      {apiKey && <TelegramLink apiKey={apiKey} replaceKey />}
    </div>
    {apiKey && <p className="code-hint">{t('telegram.replaceHint')}</p>}
  </div>;
}
