import ScheduleItem from './ScheduleItem';
import { sortByStartTime } from '../utils/time';

export default function ScheduleList({ events, categoriesById, onEdit, onDelete }) {
  const sorted = sortByStartTime(events);

  if (sorted.length === 0) {
    return <p className="schedule-list__empty">Nenhum horário cadastrado para este dia.</p>;
  }

  return (
    <>
      <ul className="schedule-list">
        {sorted.map((event) => (
          <ScheduleItem
            key={event.id}
            event={event}
            category={categoriesById.get(event.categoryId)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
      <p className="schedule-list__done">Nenhum outro compromisso hoje</p>
    </>
  );
}
