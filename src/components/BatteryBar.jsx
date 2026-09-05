import { formatHoursMinutes } from '../utils/time';

const TOTAL_MINUTES = 24 * 60;

export default function BatteryBar({ usedMinutes }) {
  const freeMinutes = Math.max(0, TOTAL_MINUTES - usedMinutes);
  const overbooked = usedMinutes > TOTAL_MINUTES;
  const freeRatio = Math.min(1, freeMinutes / TOTAL_MINUTES);
  const level = overbooked ? 'empty' : freeRatio < 0.25 ? 'low' : freeRatio < 0.5 ? 'mid' : 'high';

  return (
    <div className="battery" role="group" aria-label="Horas livres do dia">
      <div className="battery__label">
        <span className="battery__free">{formatHoursMinutes(freeMinutes)} livres</span>
        <span className="battery__total">de 24h</span>
      </div>
      <div className={`battery__shell battery__shell--${level}`}>
        <div
          className="battery__fill"
          style={{ width: `${freeRatio * 100}%` }}
        />
      </div>
      {overbooked && (
        <p className="battery__warning">
          Os horários somam {formatHoursMinutes(usedMinutes)} — mais que 24h neste dia.
        </p>
      )}
    </div>
  );
}
