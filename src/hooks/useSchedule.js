import { useCallback, useEffect, useState } from 'react';
import {
  ensureFixedCategories,
  getAllCategories,
  getAllEvents,
  putCategory,
  deleteCategory as dbDeleteCategory,
  putEvent,
  deleteEvent as dbDeleteEvent,
  exportBackup,
  importBackup,
  requestPersistentStorage,
} from '../db';
import { CATEGORY_COLOR_PALETTE } from '../constants';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSchedule() {
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [cats, evts] = await Promise.all([getAllCategories(), getAllEvents()]);
    setCategories(cats);
    setEvents(evts);
  }, []);

  useEffect(() => {
    (async () => {
      await ensureFixedCategories();
      await requestPersistentStorage();
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  const addCategory = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const color = CATEGORY_COLOR_PALETTE[Math.floor(Math.random() * CATEGORY_COLOR_PALETTE.length)];
    const category = { id: makeId(), name: trimmed, color, isFixed: false };
    await putCategory(category);
    await reload();
    return category;
  }, [reload]);

  const removeCategory = useCallback(async (id) => {
    await dbDeleteCategory(id);
    await reload();
  }, [reload]);

  const saveEvent = useCallback(async (event) => {
    const toSave = event.id ? event : { ...event, id: makeId() };
    await putEvent(toSave);
    await reload();
    return toSave;
  }, [reload]);

  const removeEvent = useCallback(async (id) => {
    await dbDeleteEvent(id);
    await reload();
  }, [reload]);

  const downloadBackup = useCallback(async () => {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `minha-agenda-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const restoreBackup = useCallback(async (file) => {
    const text = await file.text();
    const data = JSON.parse(text);
    await importBackup(data);
    await reload();
  }, [reload]);

  return {
    categories,
    events,
    loading,
    addCategory,
    removeCategory,
    saveEvent,
    removeEvent,
    downloadBackup,
    restoreBackup,
  };
}
