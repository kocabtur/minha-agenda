import { supabase, supabaseEnabled } from './supabase';
import {
  getAllCategories,
  getAllEvents,
  replaceAllCategories,
  replaceAllEvents,
  getOutboxOps,
  clearOutboxOp,
  queueOutboxOp,
} from './db';

function mapCategoryFromDb(row) {
  return { id: row.id, name: row.name, color: row.color, isFixed: row.is_fixed, user_id: row.user_id };
}

function mapEventFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    startTime: row.start_time,
    endTime: row.end_time,
    days: row.days,
    user_id: row.user_id,
  };
}

export function mapCategoryToDb(category) {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    is_fixed: !!category.isFixed,
    user_id: category.user_id,
  };
}

export function mapEventToDb(event) {
  return {
    id: event.id,
    title: event.title,
    category_id: event.categoryId,
    start_time: event.startTime,
    end_time: event.endTime,
    days: event.days,
    user_id: event.user_id,
  };
}

async function pushToSupabase(table, type, dbPayload) {
  if (type === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', dbPayload.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(table).upsert(dbPayload);
    if (error) throw error;
  }
}

// Envia direto ao Supabase; se falhar (ex.: sem internet), enfileira para tentar depois.
export async function syncOrQueue(table, type, dbPayload) {
  if (!supabaseEnabled) return;
  try {
    await pushToSupabase(table, type, dbPayload);
  } catch {
    await queueOutboxOp(table, type, dbPayload);
  }
}

async function flushOutbox() {
  const ops = await getOutboxOps();
  for (const op of ops) {
    await pushToSupabase(op.table, op.type, op.payload);
    await clearOutboxOp(op.opId);
  }
}

async function pullFromSupabase() {
  const [categoriesRes, eventsRes] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('events').select('*'),
  ]);
  if (categoriesRes.error) throw categoriesRes.error;
  if (eventsRes.error) throw eventsRes.error;
  return {
    categories: categoriesRes.data.map(mapCategoryFromDb),
    events: eventsRes.data.map(mapEventFromDb),
  };
}

// Sincroniza com o Supabase: primeiro envia a fila pendente (outbox), depois
// busca o estado atual do banco e substitui o cache local por ele.
// Exceção: se o banco remoto ainda estiver vazio (primeira conexão a um
// projeto novo), envia os dados locais existentes como carga inicial, em vez
// de sobrescrever o cache local com um banco vazio.
export async function syncWithSupabase() {
  if (!supabaseEnabled) return { synced: false, reason: 'disabled' };

  try {
    await flushOutbox();

    const remote = await pullFromSupabase();
    const remoteHasData = remote.categories.length > 0 || remote.events.length > 0;

    if (!remoteHasData) {
      const [localCategories, localEvents] = await Promise.all([getAllCategories(), getAllEvents()]);
      if (localCategories.length > 0) {
        const { error } = await supabase.from('categories').upsert(localCategories.map(mapCategoryToDb));
        if (error) throw error;
      }
      if (localEvents.length > 0) {
        const { error } = await supabase.from('events').upsert(localEvents.map(mapEventToDb));
        if (error) throw error;
      }
      return { synced: true, seeded: true };
    }

    await replaceAllCategories(remote.categories);
    await replaceAllEvents(remote.events);
    return { synced: true, seeded: false };
  } catch (error) {
    return { synced: false, reason: 'error', error };
  }
}
