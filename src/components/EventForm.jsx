import { useState } from 'react';
import { WEEKDAYS } from '../constants';

const NEW_CATEGORY_VALUE = '__new__';

function initialFormState(initialEvent, selectedDay, categories) {
  if (initialEvent) {
    return {
      title: initialEvent.title,
      categoryId: initialEvent.categoryId,
      startTime: initialEvent.startTime,
      endTime: initialEvent.endTime,
      days: initialEvent.days,
    };
  }
  return {
    title: '',
    categoryId: categories[0]?.id ?? '',
    startTime: '08:00',
    endTime: '09:00',
    days: [selectedDay],
  };
}

function EventFormDialog({ initialEvent, categories, selectedDay, onSave, onCancel, onCreateCategory }) {
  const [form, setForm] = useState(() => initialFormState(initialEvent, selectedDay, categories));
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  function toggleDay(dayId) {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter((d) => d !== dayId)
        : [...prev.days, dayId].sort((a, b) => a - b),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Informe um título para o horário.');
      return;
    }
    if (form.days.length === 0) {
      setError('Selecione ao menos um dia da semana.');
      return;
    }
    if (!form.startTime || !form.endTime) {
      setError('Informe hora de início e de término.');
      return;
    }

    let categoryId = form.categoryId;
    if (categoryId === NEW_CATEGORY_VALUE) {
      if (!newCategoryName.trim()) {
        setError('Digite o nome da nova categoria.');
        return;
      }
      const created = await onCreateCategory(newCategoryName);
      categoryId = created.id;
    }
    if (!categoryId) {
      setError('Escolha uma categoria.');
      return;
    }

    onSave({
      ...(initialEvent ?? {}),
      title: form.title.trim(),
      categoryId,
      startTime: form.startTime,
      endTime: form.endTime,
      days: form.days,
    });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Formulário de horário">
      <div className="modal">
        <h2 className="modal__title">{initialEvent ? 'Editar horário' : 'Novo horário'}</h2>
        <form onSubmit={handleSubmit} className="event-form">
          <label className="event-form__field">
            <span>Título</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ex.: Aula de Cálculo"
              autoFocus
            />
          </label>

          <label className="event-form__field">
            <span>Categoria</span>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            >
              <option value="" disabled>Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ Nova categoria</option>
            </select>
          </label>

          {form.categoryId === NEW_CATEGORY_VALUE && (
            <label className="event-form__field">
              <span>Nome da nova categoria</span>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex.: Academia"
              />
            </label>
          )}

          <div className="event-form__row">
            <label className="event-form__field">
              <span>Início</span>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              />
            </label>
            <label className="event-form__field">
              <span>Término</span>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              />
            </label>
          </div>

          <fieldset className="event-form__days">
            <legend>Repetir nos dias</legend>
            <div className="event-form__days-grid">
              {WEEKDAYS.map((day) => (
                <label key={day.id} className={`day-checkbox${form.days.includes(day.id) ? ' day-checkbox--active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.days.includes(day.id)}
                    onChange={() => toggleDay(day.id)}
                  />
                  {day.short}
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="event-form__error">{error}</p>}

          <div className="event-form__actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventForm({ open, initialEvent, categories, selectedDay, onSave, onCancel, onCreateCategory }) {
  if (!open) return null;

  return (
    <EventFormDialog
      key={initialEvent?.id ?? `new-${selectedDay}`}
      initialEvent={initialEvent}
      categories={categories}
      selectedDay={selectedDay}
      onSave={onSave}
      onCancel={onCancel}
      onCreateCategory={onCreateCategory}
    />
  );
}
