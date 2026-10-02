import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Boxes, CircleHelp, KeyRound, LayoutDashboard } from 'lucide-react';
import { Entry } from './Entry';
import { Ambient, AmbientToggle } from './Ambient';
import { BalanceView, FaqView, ModelsView } from './Views';
import { InstructionsView } from './InstructionsView';
import { ToastProvider, useToast } from './Toast';
import { I18nProvider, useI18n } from './i18n';
import { loadAccount, useResource, useStoredState } from './hooks';
import { api } from './api';
import './styles.css';

// The key lives in sessionStorage: it survives page reloads but dies with the tab.
const KEY_STORAGE = 'relay.ai.key.v1';
const readStoredKey = () => {
  try { return sessionStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
};
const writeStoredKey = key => {
  try {
    if (key) sessionStorage.setItem(KEY_STORAGE, key);
    else sessionStorage.removeItem(KEY_STORAGE);
  } catch { /* storage may be disabled */ }
};

function KeyDialog({ open, initialKey, onClose, onSave }) {
  const dialog = useRef(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const { t, translateError } = useI18n();
  useEffect(() => {
    if (!dialog.current) return;
    if (open) { setValue(initialKey); setError(''); dialog.current.showModal(); }
    else dialog.current.close();
  }, [open, initialKey]);

  async function submit(e) {
    e.preventDefault();
    const key = value.trim();
    if (!key || /\s/.test(key)) { setError(t('entry.key.errorBlank')); return; }
    setChecking(true);
    let problem = '';
    try { await api.getAccount(key); }
    catch (err) { problem = err.message || t('error.verifyFailed'); }
    setChecking(false);
    if (problem) { setError(translateError(problem)); return; }
    onSave(key);
  }

  return <dialog ref={dialog} className="key-dialog" aria-labelledby="key-dialog-title"
    onCancel={onClose}
    onClose={() => { setError(''); onClose(); }}>
    <form onSubmit={submit}>
      <span className="mono-label">{t('dialog.security')}</span>
      <h2 id="key-dialog-title" style={{ marginTop: 10 }}>{t('dialog.title')}</h2>
      <p className="lead">{t('dialog.lead')}</p>
      <label className="field-label" htmlFor="dialog-key">{t('dialog.label')}</label>
      <div className="key-field">
        <input id="dialog-key" type="password" value={value} maxLength={512}
          autoComplete="off" spellCheck={false} placeholder="sk-..."
          onChange={e => { setValue(e.target.value); setError(''); }} />
      </div>
      <p className="field-error" role="alert">{error}</p>
      <div className="dialog-actions">
        <button className="btn-primary" type="submit" disabled={checking}>{checking ? t('dialog.checking') : t('dialog.submit')}</button>
        {initialKey && <button className="btn-danger" type="button" onClick={() => onSave('')}>{t('dialog.remove')}</button>}
        <button className="btn-ghost" type="button" onClick={onClose} style={{ height: 48 }}>{t('dialog.close')}</button>
      </div>
    </form>
  </dialog>;
}

function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return <div className="language-switch" role="group" aria-label={t('topbar.language')}>
    {['ru', 'en'].map(code => <button
      key={code}
      type="button"
      className={lang === code ? 'is-active' : ''}
      onClick={() => setLang(code)}
      aria-pressed={lang === code}
    >{code.toUpperCase()}</button>)}
  </div>;
}

function Topbar({ page, setPage, apiKey, balance, onOpenKeyDialog, ambientOn, onToggleAmbient }) {
  const { t, nf } = useI18n();
  const navigation = [
    ['balance', t('topbar.nav.balance'), LayoutDashboard],
    ['instructions', t('topbar.nav.instructions'), BookOpen],
    ['models', t('topbar.nav.models'), Boxes],
    ['faq', t('topbar.nav.faq'), CircleHelp],
  ];
  return <header className="topbar">
    <a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('balance'); }}>
      <span className="brand-mark" aria-hidden="true"><KeyRound size={14} /></span>
      <span>relay.ai<small>{t('topbar.brandSub')}</small></span>
    </a>
    <nav className="main-nav" aria-label="Main">
      {navigation.map(([id, title, Icon]) => <button
        key={id}
        className={`nav-link ${id === page ? 'is-active' : ''}`}
        aria-current={id === page ? 'page' : undefined}
        onClick={() => setPage(id)}
      ><Icon size={15} />{title}</button>)}
    </nav>
    <div className="topbar-tools">
      <AmbientToggle on={ambientOn} onToggle={onToggleAmbient} />
      <LanguageSwitch />
      <button className={`chip-balance ${apiKey ? 'has-key' : ''}`} onClick={() => setPage('balance')} title={t('topbar.balance')}>
        <span className="lamp" aria-hidden="true" />
        <span>
          <small>{t('topbar.balance')}</small>
          <b>{apiKey ? (balance ? nf.format(balance.remainingTokens) : '—') : '—'}</b>
        </span>
      </button>
      <button className={`chip-key ${apiKey ? 'is-set' : ''}`} onClick={onOpenKeyDialog}>
        <KeyRound size={14} />{apiKey ? t('topbar.keySet') : t('topbar.keyUnset')}
      </button>
    </div>
  </header>;
}

function App() {
  const [storedKey] = useState(readStoredKey);
  const [entered, setEntered] = useStoredState('relay.ai.entered.v1', '');
  const [key, setKey] = useState(storedKey);
  const [os, setOs] = useStoredState('relay.ai.os.v1', 'Windows');
  const [ambientOn, setAmbientOn] = useStoredState('relay.ai.ambient.v1', '1');
  const [page, setPage] = useState('balance');
  const [dialogOpen, setDialogOpen] = useState(false);
  const account = useResource(loadAccount, key);
  const toast = useToast();
  const { t } = useI18n();

  // A stored key means the user already passed entry in this tab.
  const showEntry = !entered && !storedKey;

  function finishEntry(entryKey, entryOs) {
    setKey(entryKey);
    writeStoredKey(entryKey);
    setOs(entryOs);
    setEntered('1');
    setPage(entryKey ? 'balance' : 'instructions');
  }

  function saveKey(newKey) {
    setKey(newKey);
    writeStoredKey(newKey);
    setDialogOpen(false);
    toast(newKey ? t('dialog.toastSet') : t('dialog.toastRemoved'));
  }

  return <>
    {ambientOn === '1' && <Ambient />}
    {showEntry && <Entry onDone={finishEntry} ambientOn={ambientOn === '1'} onToggleAmbient={() => setAmbientOn(ambientOn === '1' ? '0' : '1')} />}
    <div className={`app-shell ${showEntry ? '' : 'is-ready'}`}>
      <Topbar page={page} setPage={setPage} apiKey={key} balance={account.data} onOpenKeyDialog={() => setDialogOpen(true)}
        ambientOn={ambientOn === '1'} onToggleAmbient={() => setAmbientOn(ambientOn === '1' ? '0' : '1')} />
      <main>
        {page === 'balance' && <BalanceView apiKey={key} accountResource={account} onOpenKeyDialog={() => setDialogOpen(true)} onGoInstructions={() => setPage('instructions')} />}
        {page === 'instructions' && <InstructionsView apiKey={key} os={os} setOs={setOs} onOpenKeyDialog={() => setDialogOpen(true)} />}
        {page === 'models' && <ModelsView apiKey={key} onOpenKeyDialog={() => setDialogOpen(true)} />}
        {page === 'faq' && <FaqView />}
      </main>
      <KeyDialog open={dialogOpen} initialKey={key} onClose={() => setDialogOpen(false)} onSave={saveKey} />
    </div>
  </>;
}

createRoot(document.getElementById('root')).render(
  <I18nProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </I18nProvider>
);
