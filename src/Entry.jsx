import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Monitor, Terminal, Lock } from 'lucide-react';
import { verifyKey } from './hooks';
import { useI18n } from './i18n';
import { AmbientToggle } from './Ambient';

/**
 * Fullscreen two-stage entry: first the API key, then the OS.
 * Either stage can be skipped — the cabinet works without a key
 * (instructions stay available, balance/models require it).
 */
export function Entry({ onDone, ambientOn, onToggleAmbient }) {
  const [stage, setStage] = useState('key'); // 'key' | 'os'
  const [key, setKey] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const { t, translateError } = useI18n();

  const osOptions = [
    { id: 'Windows', label: t('entry.os.windows'), note: t('entry.os.windows.note'), Icon: Monitor },
    { id: 'macOS', label: t('entry.os.macos'), note: t('entry.os.macos.note'), Icon: Terminal },
    { id: 'Linux', label: t('entry.os.linux'), note: t('entry.os.linux.note'), Icon: Terminal },
  ];

  async function submitKey(e) {
    e.preventDefault();
    const value = key.trim();
    if (!value || /\s/.test(value)) {
      setError(t('entry.key.errorBlank'));
      return;
    }
    setChecking(true);
    setError('');
    const problem = await verifyKey(value);
    setChecking(false);
    if (problem) {
      setError(translateError(problem));
      return;
    }
    setStage('os');
  }

  return <div className="entry" id="entry">
    <div className="entry-corner" aria-hidden="true" />
    <div className="entry-brandline"><i aria-hidden="true" /> Relay AI</div>
    <AmbientToggle on={ambientOn} onToggle={onToggleAmbient} />

    {stage === 'key' && <section className={`entry-stage glass ${stage === 'key' ? 'is-active' : ''}`} aria-label={t('entry.key.label')}>
      <div className="entry-kicker">
        <span className="mono-label">{t('entry.key.kicker')}</span>
        <span className="mono-label">{t('entry.key.tag')}</span>
      </div>
      <h1>{t('entry.key.titleA')} <em>{t('entry.key.titleB')}</em></h1>
      <p className="entry-intro">{t('entry.key.intro')}</p>
      <form onSubmit={submitKey} noValidate>
        <label className="field-label" htmlFor="entry-key">{t('entry.key.label')}</label>
        <div className="key-field">
          <input
            id="entry-key"
            type={reveal ? 'text' : 'password'}
            value={key}
            maxLength={512}
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-..."
            onChange={e => { setKey(e.target.value); setError(''); }}
          />
          <button type="button" className="ghost-btn" onClick={() => setReveal(!reveal)} aria-label={reveal ? t('entry.key.hide') : t('entry.key.show')}>
            {reveal ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        <p className="field-error" role="alert">{error}</p>
        <p className="field-hint">{t('entry.key.hint')}</p>
        <button className="btn-primary" type="submit" disabled={checking}>
          {checking ? <><Loader2 size={17} className="spin" /> {t('entry.key.checking')}</> : <>{t('entry.key.submit')} <ArrowRight size={17} /></>}
        </button>
      </form>
      <div className="entry-skip">
        <button type="button" onClick={() => onDone('', 'Windows')}>{t('entry.key.skip')}</button>
      </div>
      <p className="entry-security"><Lock size={10} style={{ verticalAlign: '-1px', marginRight: 6 }} />{t('entry.key.security')}</p>
    </section>}

    {stage === 'os' && <section className={`entry-stage glass ${stage === 'os' ? 'is-active' : ''}`} aria-label={t('entry.os.kicker')}>
      <div className="entry-kicker">
        <span className="mono-label">{t('entry.os.kicker')}</span>
        <span className="mono-label">{t('entry.os.verified')}</span>
      </div>
      <h1>{t('entry.os.titleA')} <em>{t('entry.os.titleB')}</em></h1>
      <p className="entry-intro">{t('entry.os.intro')}</p>
      <div className="os-grid">
        {osOptions.map(({ id, label, note, Icon }, i) => (
          <button type="button" key={id} className="os-card" onClick={() => onDone(key.trim(), id)}>
            <span className="os-num">0{i + 1}</span>
            <span className="os-glyph"><Icon size={34} strokeWidth={1.2} /></span>
            <strong>{label}</strong>
            <small>{note}</small>
          </button>
        ))}
      </div>
      <p className="entry-security"><KeyRound size={10} style={{ verticalAlign: '-1px', marginRight: 6 }} />{t('entry.os.security')}</p>
    </section>}
  </div>;
}
