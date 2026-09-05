import CategoryBadge from './CategoryBadge';
import { durationMinutes, formatHoursMinutes } from '../utils/time';

export default function ScheduleItem({ event, category, onEdit, onDelete }) {
  const duration = durationMinutes(event.startTime, event.endTime);

  return (
    <li className="schedule-item" style={{ '--category-color': category?.color ?? '#999' }}>
      <div className="schedule-item__time">
        <span>{event.startTime}</span>
        <span className="schedule-item__time-sep">–</span>
        <span>{event.endTime}</span>
      </div>
      <div className="schedule-item__body">
        <p className="schedule-item__title">{event.title}</p>
        <div className="schedule-item__meta">
          <CategoryBadge category={category} />
          <span className="schedule-item__duration">{formatHoursMinutes(duration)}</span>
        </div>
      </div>
      <div className="schedule-item__actions">
        <button type="button" onClick={() => onEdit(event)} aria-label="Editar horário">
          Editar
        </button>
        <button type="button" className="schedule-item__delete" onClick={() => onDelete(event)} aria-label="Excluir horário">
          Excluir
        </button>
      </div>
    </li>
  );
}
