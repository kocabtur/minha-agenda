import { useCallback, useState } from 'react';
import { clearAllLocalData } from '../db';

const STORAGE_KEY = 'minha-agenda-profile-id';
const DIACRITICS_REGEX = /[̀-ͯ]/g;

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function useProfile() {
  const [profileId, setProfileId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const selectProfile = useCallback((name) => {
    const id = slugify(name);
    if (!id) return null;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // armazenamento indisponível (ex.: modo privado) — segue só em memória
    }
    setProfileId(id);
    return id;
  }, []);

  const switchProfile = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
    await clearAllLocalData();
    setProfileId(null);
  }, []);

  return { profileId, selectProfile, switchProfile };
}
