import { Loader2, Lock } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { adminApi } from './api';

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminApi.login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Lock className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage enquiries and the photo gallery.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className="field-input"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'admin-login-error' : undefined}
          />
          {error && (
            <p id="admin-login-error" className="field-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={busy || !password}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
