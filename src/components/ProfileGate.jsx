import { useState } from 'react';

export default function ProfileGate({ onSelectProfile }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const id = onSelectProfile(name);
    if (!id) {
      setError('Digite um nome com pelo menos uma letra ou número.');
    }
  }

  return (
    <div className="auth-gate">
      <div className="auth-gate__card">
        <h1 className="auth-gate__title">Minha Agenda</h1>
        <p className="auth-gate__subtitle">
          Digite seu nome para ver e editar a sua agenda. Cada nome tem os próprios horários,
          separados dos de outras pessoas que usarem este mesmo link.
        </p>

        <form onSubmit={handleSubmit} className="auth-gate__form">
          <label className="event-form__field">
            <span>Seu nome</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: joao"
              autoFocus
              required
            />
          </label>

          {error && <p className="event-form__error">{error}</p>}

          <button type="submit" className="btn btn--primary">Entrar</button>
        </form>

        <p className="auth-gate__hint">
          Sem senha: quem souber esse nome também acessa esses horários. Combine com quem for usar
          o app um nome que só vocês conheçam, se quiser mais privacidade.
        </p>
      </div>
    </div>
  );
}
