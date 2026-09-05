import { useMemo, useState } from 'react';
import BatteryBar from './components/BatteryBar';
import DayTabs from './components/DayTabs';
import ScheduleList from './components/ScheduleList';
import EventForm from './components/EventForm';
import SettingsPanel from './components/SettingsPanel';
import SyncStatus from './components/SyncStatus';
import GearIcon from './components/icons/GearIcon';
import { useSchedule } from './hooks/useSchedule';
import { durationMinutes } from './utils/time';
import { WEEKDAYS } from './constants';

function todayIndex() {
  return new Date().getDay();
}

export default function App() {
  const {
    categories,
    events,
    loading,
    syncState,
    addCategory,
    removeCategory,
    saveEvent,
    removeEvent,
    downloadBackup,
    restoreBackup,
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const categoriesById = useMemo(() => {
    const map = new Map();
    for (const cat of categories) map.set(cat.id, cat);
    return map;
  }, [categories]);

  const eventsForDay = useMemo(
    () => events.filter((e) => e.days.includes(selectedDay)),
    [events, selectedDay],
  );

  const usedMinutes = useMemo(
    () => eventsForDay.reduce((sum, e) => sum + durationMinutes(e.startTime, e.endTime), 0),
    [eventsForDay],
  );

  const dayLabel = WEEKDAYS.find((d) => d.id === selectedDay)?.label ?? '';

  function openNewEventForm() {
    setEditingEvent(null);
    setFormOpen(true);
  }

  function openEditEventForm(event) {
    setEditingEvent(event);
    setFormOpen(true);
  }

  async function handleSaveEvent(event) {
    await saveEvent(event);
    setFormOpen(false);
    setEditingEvent(null);
  }

  async function handleDeleteEvent(event) {
    if (window.confirm(`Excluir "${event.title}"?`)) {
      await removeEvent(event.id);
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <p>Carregando agenda...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-top">
          <div>
            <h1 className="app__title">Minha Agenda</h1>
            <SyncStatus state={syncState} />
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Configurações"
            onClick={() => setSettingsOpen(true)}
          >
            <GearIcon />
          </button>
        </div>
        <div className="battery-card">
          <BatteryBar usedMinutes={usedMinutes} />
        </div>
      </header>

      <DayTabs selectedDay={selectedDay} onSelect={setSelectedDay} />

      <main className="app__main">
        <div className="app__main-header">
          <h2 className="app__day-label">{dayLabel}</h2>
          <button type="button" className="btn btn--primary btn--small" onClick={openNewEventForm}>
            + Novo horário
          </button>
        </div>

        <ScheduleList
          events={eventsForDay}
          categoriesById={categoriesById}
          onEdit={openEditEventForm}
          onDelete={handleDeleteEvent}
        />
      </main>

      <EventForm
        open={formOpen}
        initialEvent={editingEvent}
        categories={categories}
        selectedDay={selectedDay}
        onSave={handleSaveEvent}
        onCancel={() => setFormOpen(false)}
        onCreateCategory={addCategory}
      />

      <SettingsPanel
        open={settingsOpen}
        categories={categories}
        onClose={() => setSettingsOpen(false)}
        onRemoveCategory={removeCategory}
        onExport={downloadBackup}
        onImport={restoreBackup}
      />
    </div>
  );
}
