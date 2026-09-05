import { useState } from 'react';

export default function AuthGate({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setError('');
    try {
      await onSignIn(email.trim());
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err.message ?? 'Não foi possível enviar o link de acesso.');
    }
  }

  return (
    <div className="auth-gate">
      <div className="auth-gate__card">
        <h1 className="auth-gate__title">Minha Agenda</h1>
        <p className="auth-gate__subtitle">Entre com seu e-mail para acessar sua agenda pessoal.</p>

        {status === 'sent' ? (
          <p className="auth-gate__sent">
            Enviamos um link de acesso para <strong>{email}</strong>. Abra seu e-mail neste
            aparelho e toque no link para entrar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-gate__form">
            <label className="event-form__field">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoFocus
                required
              />
            </label>

            {error && <p className="event-form__error">{error}</p>}

            <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando...' : 'Enviar link de acesso'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
