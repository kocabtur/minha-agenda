import { WEEKDAYS } from '../constants';

export default function DayTabs({ selectedDay, onSelect }) {
  return (
    <nav className="day-tabs" aria-label="Dias da semana">
      {WEEKDAYS.map((day) => (
        <button
          key={day.id}
          type="button"
          className={`day-tabs__item${day.id === selectedDay ? ' day-tabs__item--active' : ''}`}
          onClick={() => onSelect(day.id)}
          aria-current={day.id === selectedDay ? 'true' : undefined}
        >
          {day.short}
        </button>
      ))}
    </nav>
  );
}
