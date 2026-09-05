import { useCallback, useEffect, useRef, useState } from 'react';
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
import { syncOrQueue, syncWithSupabase, mapCategoryToDb, mapEventToDb } from '../sync';
import { supabaseEnabled } from '../supabase';
import { CATEGORY_COLOR_PALETTE } from '../constants';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSchedule(userId = null) {
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState(supabaseEnabled ? 'syncing' : 'disabled');
  const didInit = useRef(false);

  const reload = useCallback(async () => {
    const [cats, evts] = await Promise.all([getAllCategories(), getAllEvents()]);
    setCategories(cats);
    setEvents(evts);
  }, []);

  const runSync = useCallback(async () => {
    if (!supabaseEnabled) return;
    if (!navigator.onLine) {
      setSyncState('offline');
      return;
    }
    setSyncState('syncing');
    const result = await syncWithSupabase();
    if (result.synced) {
      await reload();
      setSyncState('synced');
    } else if (result.reason === 'error') {
      setSyncState('error');
    } else {
      setSyncState('offline');
    }
  }, [reload]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    (async () => {
      await ensureFixedCategories(userId);
      await requestPersistentStorage();
      await reload();
      setLoading(false);
      await runSync();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabaseEnabled) return undefined;
    window.addEventListener('online', runSync);
    return () => window.removeEventListener('online', runSync);
  }, [runSync]);

  const addCategory = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const color = CATEGORY_COLOR_PALETTE[Math.floor(Math.random() * CATEGORY_COLOR_PALETTE.length)];
    const category = { id: makeId(), name: trimmed, color, isFixed: false, ...(userId && { user_id: userId }) };
    await putCategory(category);
    await reload();
    await syncOrQueue('categories', 'upsert', mapCategoryToDb(category));
    return category;
  }, [reload, userId]);

  const removeCategory = useCallback(async (id) => {
    await dbDeleteCategory(id);
    await reload();
    await syncOrQueue('categories', 'delete', { id });
  }, [reload]);

  const saveEvent = useCallback(async (event) => {
    const toSave = event.id ? event : { ...event, id: makeId(), ...(userId && { user_id: userId }) };
    await putEvent(toSave);
    await reload();
    await syncOrQueue('events', 'upsert', mapEventToDb(toSave));
    return toSave;
  }, [reload, userId]);

  const removeEvent = useCallback(async (id) => {
    await dbDeleteEvent(id);
    await reload();
    await syncOrQueue('events', 'delete', { id });
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
    syncState,
    addCategory,
    removeCategory,
    saveEvent,
    removeEvent,
    downloadBackup,
    restoreBackup,
  };
}
