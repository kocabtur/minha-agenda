import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, FIXED_CATEGORIES } from './constants';

let dbPromise;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('outbox')) {
          db.createObjectStore('outbox', { keyPath: 'opId', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function ensureFixedCategories(userId = null) {
  const db = await getDB();
  const tx = db.transaction('categories', 'readwrite');
  const existing = await tx.store.getAll();
  const existingIds = new Set(existing.map((c) => c.id));
  for (const category of FIXED_CATEGORIES) {
    const id = userId ? `${userId}-${category.id}` : category.id;
    if (!existingIds.has(id)) {
      await tx.store.put({ ...category, id, ...(userId ? { user_id: userId } : {}) });
    }
  }
  await tx.done;
}

export async function getAllCategories() {
  const db = await getDB();
  return db.getAll('categories');
}

export async function putCategory(category) {
  const db = await getDB();
  return db.put('categories', category);
}

export async function deleteCategory(id) {
  const db = await getDB();
  return db.delete('categories', id);
}

export async function getAllEvents() {
  const db = await getDB();
  return db.getAll('events');
}

export async function putEvent(event) {
  const db = await getDB();
  return db.put('events', event);
}

export async function deleteEvent(id) {
  const db = await getDB();
  return db.delete('events', id);
}

export async function exportBackup() {
  const [categories, events] = await Promise.all([getAllCategories(), getAllEvents()]);
  return {
    app: 'minha-agenda',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    categories,
    events,
  };
}

export async function importBackup(data) {
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.events)) {
    throw new Error('Arquivo de backup inválido.');
  }
  const db = await getDB();
  const tx = db.transaction(['categories', 'events'], 'readwrite');
  for (const category of data.categories) {
    await tx.objectStore('categories').put(category);
  }
  for (const event of data.events) {
    await tx.objectStore('events').put(event);
  }
  await tx.done;
}

export async function replaceAllCategories(categories) {
  const db = await getDB();
  const tx = db.transaction('categories', 'readwrite');
  await tx.store.clear();
  for (const category of categories) {
    await tx.store.put(category);
  }
  await tx.done;
}

export async function replaceAllEvents(events) {
  const db = await getDB();
  const tx = db.transaction('events', 'readwrite');
  await tx.store.clear();
  for (const event of events) {
    await tx.store.put(event);
  }
  await tx.done;
}

export async function queueOutboxOp(table, type, payload) {
  const db = await getDB();
  await db.add('outbox', { table, type, payload, queuedAt: Date.now() });
}

export async function getOutboxOps() {
  const db = await getDB();
  return db.getAll('outbox');
}

export async function clearOutboxOp(opId) {
  const db = await getDB();
  return db.delete('outbox', opId);
}

export async function clearAllLocalData() {
  const db = await getDB();
  const tx = db.transaction(['categories', 'events', 'outbox'], 'readwrite');
  await Promise.all([
    tx.objectStore('categories').clear(),
    tx.objectStore('events').clear(),
    tx.objectStore('outbox').clear(),
  ]);
  await tx.done;
}

export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}
