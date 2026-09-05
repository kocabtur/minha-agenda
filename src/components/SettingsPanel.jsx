import { useRef } from 'react';
import CategoryBadge from './CategoryBadge';

export default function SettingsPanel({
  open,
  categories,
  userEmail,
  onClose,
  onRemoveCategory,
  onExport,
  onImport,
  onSignOut,
}) {
  const fileInputRef = useRef(null);

  if (!open) return null;

  const customCategories = categories.filter((c) => !c.isFixed);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onImport(file);
      window.alert('Backup importado com sucesso.');
    } catch (err) {
      window.alert(`Não foi possível importar o backup: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Configurações">
      <div className="modal">
        <h2 className="modal__title">Configurações</h2>

        {onSignOut && (
          <section className="settings-section">
            <h3>Conta</h3>
            {userEmail && <p className="settings-section__hint">Conectado como {userEmail}.</p>}
            <div className="settings-section__actions">
              <button type="button" className="btn btn--ghost" onClick={onSignOut}>
                Sair
              </button>
            </div>
          </section>
        )}

        <section className="settings-section">
          <h3>Categorias personalizadas</h3>
          {customCategories.length === 0 ? (
            <p className="settings-section__empty">Nenhuma categoria personalizada ainda.</p>
          ) : (
            <ul className="settings-category-list">
              {customCategories.map((cat) => (
                <li key={cat.id}>
                  <CategoryBadge category={cat} />
                  <button
                    type="button"
                    className="settings-category-list__remove"
                    onClick={() => onRemoveCategory(cat.id)}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="settings-section">
          <h3>Backup dos dados</h3>
          <p className="settings-section__hint">
            Os dados ficam salvos neste dispositivo (armazenamento persistente do navegador).
            Exporte um backup periodicamente e guarde o arquivo em local seguro (ex.: iCloud/Arquivos) para não perder seus horários.
          </p>
          <div className="settings-section__actions">
            <button type="button" className="btn btn--primary" onClick={onExport}>
              Exportar backup (.json)
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => fileInputRef.current?.click()}>
              Importar backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={handleFileChange}
            />
          </div>
        </section>

        <div className="event-form__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
