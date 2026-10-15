import React from 'react';
import { ArrowUpRight, Send } from 'lucide-react';
import { useI18n } from './i18n';

const botUrl = 'https://t.me/q2q2aibot';

export function TelegramLink({ className = 'btn-ghost' }) {
  const { t } = useI18n();
  return <a className={`telegram-link ${className}`} href={botUrl} target="_blank" rel="noopener noreferrer">
    <Send size={16} aria-hidden="true" />
    {t('telegram.open')}
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
    <TelegramLink />
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
      <li>{t('telegram.step.open')}</li>
      <li>{t('telegram.step.start')}</li>
      <li>{t('telegram.step.key')}</li>
      <li>{t('telegram.step.chat')}</li>
    </ol>
    <div className="telegram-actions">
      <TelegramLink />
    </div>
  </div>;
}
