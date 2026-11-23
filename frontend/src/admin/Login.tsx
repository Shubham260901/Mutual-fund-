import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, MailCheck } from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useId, useState } from 'react';
import { adminApi } from './api';
import { primaryFill } from './ui';

const MIN_PASSWORD_LENGTH = 10;

type Mode = 'signin' | 'forgot' | 'forgot-sent' | 'reset' | 'reset-done';

/** The one-time token from a reset link (/admin?reset=…). */
const readResetToken = () => new URLSearchParams(window.location.search).get('reset') ?? '';

export const hasResetToken = () => !!readResetToken();

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [resetToken] = useState(readResetToken);
  // Take the token out of the address bar (and so out of history and bookmarks) once it's in state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('reset')) return;
    params.delete('reset');
    const qs = params.toString();
    history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`);
  }, []);
  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const switchTo = (next: Mode) => {
    setMode(next);
    setError('');
    setPassword('');
    setConfirm('');
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const signIn = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await adminApi.login(email.trim(), password);
      onSuccess();
    });
  };

  const requestReset = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await adminApi.forgotPassword(email.trim());
      setMode('forgot-sent');
    });
  };

  const saveNewPassword = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (password !== confirm) return setError('The two passwords don’t match.');
    void run(async () => {
      await adminApi.resetPassword(resetToken, password);
      setPassword('');
      setConfirm('');
      setMode('reset-done');
    });
  };

  if (mode === 'forgot-sent') {
    return (
      <Shell icon={<MailCheck className="h-6 w-6" aria-hidden />} title="Check your email" subtitle="">
        <p className="text-sm leading-relaxed text-ink-muted" role="status">
          If <span className="font-semibold text-navy-900">{email.trim()}</span> is the admin email, a link to reset your password is on its
          way. It works once and expires in 30 minutes.
        </p>
        <BackLink onClick={() => switchTo('signin')} />
      </Shell>
    );
  }

  if (mode === 'reset-done') {
    return (
      <Shell icon={<KeyRound className="h-6 w-6" aria-hidden />} title="Password updated" subtitle="">
        <p className="text-sm leading-relaxed text-ink-muted" role="status">
          Your new password is saved and any other signed-in devices have been signed out.
        </p>
        <SubmitButton busy={false} type="button" onClick={() => switchTo('signin')}>
          Sign in
        </SubmitButton>
      </Shell>
    );
  }

  if (mode === 'forgot') {
    return (
      <Shell
        as="form"
        onSubmit={requestReset}
        icon={<KeyRound className="h-6 w-6" aria-hidden />}
        title="Forgot password?"
        subtitle="Enter the admin email and we’ll send you a link to set a new password."
      >
        <EmailField value={email} onChange={setEmail} error={error} />
        <SubmitButton busy={busy} disabled={!email.trim()} busyLabel="Sending…">
          Send reset link
        </SubmitButton>
        <BackLink onClick={() => switchTo('signin')} />
      </Shell>
    );
  }

  if (mode === 'reset') {
    return (
      <Shell
        as="form"
        onSubmit={saveNewPassword}
        icon={<KeyRound className="h-6 w-6" aria-hidden />}
        title="Set a new password"
        subtitle={`Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`}
      >
        <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" autoFocus />
        <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={error} />
        <SubmitButton busy={busy} disabled={!password || !confirm} busyLabel="Saving…">
          Save new password
        </SubmitButton>
        <BackLink onClick={() => switchTo('signin')} />
      </Shell>
    );
  }

  return (
    <Shell as="form" onSubmit={signIn} icon={<Lock className="h-6 w-6" aria-hidden />} title="Admin sign in" subtitle="Manage enquiries and the photo gallery.">
      <EmailField value={email} onChange={setEmail} />
      <div>
        <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" error={error} />
        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            onClick={() => switchTo('forgot')}
            className="rounded text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
          >
            Forgot password?
          </button>
        </div>
      </div>
      <SubmitButton busy={busy} disabled={!email.trim() || !password} busyLabel="Signing in…">
        Sign in
      </SubmitButton>
    </Shell>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function Shell({
  as = 'div',
  onSubmit,
  icon,
  title,
  subtitle,
  children,
}: {
  as?: 'div' | 'form';
  onSubmit?: (e: FormEvent) => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const Tag = as;
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-10">
      <Tag onSubmit={onSubmit} noValidate={as === 'form' ? true : undefined} className="card w-full max-w-sm space-y-5 p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">{icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {children}
      </Tag>
    </div>
  );
}

function EmailField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        Email
      </label>
      <input
        id={id}
        className="field-input"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  autoFocus,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
  error?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="field-input pr-12"
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink-subtle hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-[1.125rem] w-[1.125rem]" aria-hidden /> : <Eye className="h-[1.125rem] w-[1.125rem]" aria-hidden />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({
  busy,
  busyLabel,
  disabled,
  type = 'submit',
  onClick,
  children,
}: {
  busy: boolean;
  busyLabel?: string;
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed ${primaryFill}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {busy ? busyLabel : children}
    </button>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded text-sm font-semibold text-ink-muted hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to sign in
    </button>
  );
}
