import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export function isCloudStorageEnabled() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key);
}

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  supabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseClient;
}

export async function loadPersistedStore({ storePath, dataDir, createDefaultStore, migrateStore }) {
  if (isCloudStorageEnabled()) {
    const sb = getSupabase();
    const { data: row, error } = await sb
      .from('love_space_state')
      .select('data')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase 读取失败: ${error.message}`);
    }

    if (!row || !row.data) {
      const initial = createDefaultStore();
      const { error: upsertErr } = await sb.from('love_space_state').upsert({
        id: 'main',
        data: initial,
        updated_at: new Date().toISOString(),
      });
      if (upsertErr) {
        throw new Error(`Supabase 初始化失败: ${upsertErr.message}`);
      }
      return initial;
    }

    return migrateStore(row.data);
  }

  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(storePath)) {
    const initial = createDefaultStore();
    fs.writeFileSync(storePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    const migrated = migrateStore(JSON.parse(raw));
    fs.writeFileSync(storePath, JSON.stringify(migrated, null, 2), 'utf8');
    return migrated;
  } catch {
    const fallback = createDefaultStore();
    fs.writeFileSync(storePath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

export async function persistStoreData({ store, storePath, dataDir }) {
  if (isCloudStorageEnabled()) {
    const sb = getSupabase();
    const { error } = await sb.from('love_space_state').upsert({
      id: 'main',
      data: store,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      throw new Error(`Supabase 保存失败: ${error.message}`);
    }
    return;
  }

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
}
