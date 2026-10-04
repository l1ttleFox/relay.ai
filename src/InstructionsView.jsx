import React, { useMemo, useState } from 'react';
import { ArrowRight, KeyRound, Monitor } from 'lucide-react';
import { loadGuides, useResource } from './hooks';
import { personalizeCommand, instructionStep } from './instructionCommands';
import { translateCode, translateNotice, translateStep } from './instructionsEn';
import { CodeWindow, ErrorBlock, LoadingBlock } from './components';
import { useToast } from './Toast';
import { useI18n } from './i18n';

const osList = ['Windows', 'macOS', 'Linux'];

function PublicConnectionOverview({ guide, activeOs }) {
  const { t } = useI18n();
  const options = [
    ['01', t('instructions.public.option1.title'), t('instructions.public.option1.text')],
    ['02', t('instructions.public.option2.title'), t('instructions.public.option2.text')],
    ['03', t('instructions.public.option3.title'), t('instructions.public.option3.text')],
  ];
  return <div className="public-connection-overview">
    <div className="public-overview-head">
      <span className="mono-label">{t('instructions.public.label')}</span>
      <p>{t('instructions.public.lead')}</p>
      <p>{t('instructions.public.supported', { title: guide.title, systems: guide.os.join(' · ') })}</p>
      {!guide.os.includes(activeOs) && <p>{t('instructions.unavailableA', { title: guide.title, os: activeOs })}</p>}
    </div>
    <div className="connection-option-grid">
      {options.map(([number, title, text]) => <article className="connection-option" key={number}>
        <span className="connection-option-number">{number}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </article>)}
    </div>
    <p className="public-overview-foot">{t('instructions.public.footer')}</p>
  </div>;
}

function clientBadge(title) {
  const words = title.replace(/[^A-Za-zА-Яа-яЁё0-9 ]/g, '').trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : title.slice(0, 2)).toUpperCase();
}

export function InstructionsView({ apiKey, os, setOs, onOpenKeyDialog }) {
  const resource = useResource(loadGuides, '', false);
  const [selected, setSelected] = useState('codex');
  const toast = useToast();
  const { t, lang, translateError } = useI18n();
  const guides = resource.data?.guides ?? [];
  const guide = guides.find(g => g.id === selected) ?? guides[0];
  const activeOs = osList.includes(os) ? os : 'Windows';

  const content = useMemo(() => {
    if (!guide || !resource.data) return null;
    const supported = guide.os.includes(activeOs);
    if (!apiKey) return { supported };
    const example = supported
      ? guide.examples.find(item => !item.os || item.os === activeOs)
        || (guide.source === 'local-example'
          ? { language: 'text', code: `Base URL: ${resource.data.baseUrl}\nAPI Key: YOUR_API_KEY\nModel: MODEL_ID` }
          : null)
      : null;
    const env = resource.data.environment?.find(item => item.os === (activeOs === 'Windows' ? 'Windows' : 'macOS/Linux'))?.code;
    const language = activeOs === 'Windows' ? 'powershell' : 'bash';
    const code = example
      ? translateCode(['python', 'javascript', 'curl'].includes(guide.id)
        ? `${personalizeCommand(env || '', apiKey, language)}\n\n${example.code}`
        : personalizeCommand(example.code, apiKey, example.language), lang)
      : '';
    const steps = (guide.steps ?? []).map(step => {
      const personalized = instructionStep(step, Boolean(apiKey));
      return lang === 'en' ? translateStep(personalized) : personalized;
    });
    const notice = guide.notice
      ? (lang === 'en'
        ? translateNotice(guide.notice.replace('По инструкции провайдера требуется', 'Требуется'))
        : guide.notice.replace('По инструкции провайдера требуется', 'Требуется'))
      : null;
    return { supported, example, code, steps, notice };
  }, [guide, resource.data, activeOs, apiKey, lang]);

  const onCopied = (msg, error) => {
    if (msg) toast(msg, error);
    else toast(t('instructions.copied'));
  };

  return <div className="view">
    <div className="page-head">
      <div>
        <span className="mono-label">{t('instructions.kicker')}</span>
        <h1>{t('instructions.titleA')} <em>{t('instructions.titleB')}</em></h1>
        <p>{apiKey ? t('instructions.descKey') : t('instructions.descNoKey')}</p>
      </div>
      {!apiKey && <button className="btn-ghost" onClick={onOpenKeyDialog} style={{ flex: '0 0 auto' }}>
        <KeyRound size={15} /> {t('balance.connect')}
      </button>}
    </div>

    <div className="os-tabs" role="tablist" aria-label="OS">
      {osList.map(name => <button
        key={name}
        role="tab"
        aria-selected={name === activeOs}
        className={name === activeOs ? 'is-active' : ''}
        onClick={() => setOs(name)}
      >
        {name === 'Windows' && <Monitor size={14} aria-hidden="true" />}{name}
      </button>)}
    </div>

    {resource.loading && !resource.data && <LoadingBlock label={t('component.loading')} />}
    {resource.error && !resource.data && <ErrorBlock message={translateError(resource.error)} />}

    {resource.data && guide && <div className="workspace glass">
      <aside className="client-sidebar">
        <div className="sidebar-head"><span>{t('instructions.clients')}</span><span>{guides.length}</span></div>
        <div className="client-list" role="listbox" aria-label={t('instructions.clients')}>
          {guides.map(g => <button
            key={g.id}
            role="option"
            aria-selected={g.id === guide.id}
            className={`client-btn ${g.id === guide.id ? 'is-active' : ''}`}
            onClick={() => setSelected(g.id)}
          >
            <span className="client-badge" aria-hidden="true">{clientBadge(g.title)}</span>
            <span className="title">{g.title}</span>
            <span className="src">{g.source === 'provider-docs' ? 'docs' : 'ex'}</span>
          </button>)}
        </div>
      </aside>

      <section className="guide-panel">
        <header className="guide-head">
          <span className="client-badge" aria-hidden="true">{clientBadge(guide.title)}</span>
          <div>
            <h2>{guide.title}</h2>
            <p>{activeOs} · {guide.source === 'provider-docs' ? t('instructions.providerDocs') : t('instructions.localExample')}</p>
          </div>
          <span className="spacer" />
          {guide.status === 'example' && <span className="mono-label" style={{ flex: '0 0 auto' }}>{t('instructions.example')}</span>}
        </header>

          {!apiKey && <PublicConnectionOverview guide={guide} activeOs={activeOs} />}

          {apiKey && !content?.supported && <div className="guide-empty">
           {t('instructions.unavailableA', { title: guide.title, os: activeOs })}
           <br />{t('instructions.unavailableB')}
         </div>}

         {apiKey && content?.supported && <>
          {content.steps.length > 0 && <>
            <p className="section-label">{t('instructions.steps')}</p>
            <ol className="steps-list">
              {content.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </>}

          {content.notice && <p className="notice-card">{content.notice}</p>}

          {guide.modelFormat && <p className="model-format">{t('instructions.modelFormat')} <code>{guide.modelFormat}</code></p>}

          {content.code && <>
            <p className="section-label">{activeOs === 'Windows' ? 'PowerShell' : 'Terminal'}</p>
            <p className="code-hint">
              {t('instructions.hintKey')}
              {content.code.includes('MODEL_ID') && t('instructions.hintModelId')}
            </p>
            <CodeWindow title={`${guide.title} · ${activeOs}`} code={content.code} onCopied={onCopied} />
          </>}

          {guide.downloadUrl && <p className="model-format">
            {t('instructions.download')} <a href={guide.downloadUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{guide.downloadUrl} <ArrowRight size={12} style={{ verticalAlign: '-1px' }} /></a>
          </p>}

          {content.example?.uninstall && <details className="uninstall">
            <summary>{t('instructions.uninstall')}</summary>
            <pre>{content.example.uninstall}</pre>
          </details>}
        </>}
      </section>
    </div>}
  </div>;
}
