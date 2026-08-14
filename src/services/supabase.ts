import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PalimpsestDocument } from '../types';
import { INITIAL_DOCUMENTS } from '../data/initialData';

// Extract and strip accidental quotes or whitespace
const getEnvVar = (key: string): string => {
  try {
    const env = (import.meta as any).env || {};
    const val = env[key] || '';
    return String(val).replace(/^["']|["']$/g, '').trim();
  } catch {
    return '';
  }
};

const rawUrl = getEnvVar('VITE_SUPABASE_URL');
const rawKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Strict URL validator using native browser URL parser
const isValidHttpUrl = (urlString: string): boolean => {
  if (!urlString) return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Check if credentials are validly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    isValidHttpUrl(rawUrl) &&
    Boolean(rawKey) &&
    rawUrl !== 'https://your-supabase-url.supabase.co' &&
    rawKey !== 'your-anon-key'
  );
};

// ALWAYS guaranteed to be a valid HTTP/HTTPS URL string
const validUrl = isSupabaseConfigured() ? rawUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured() ? rawKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: { 
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Prevents file:// URL parsing issues in Electron
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    // Prevent false offline drops in Electron file:// environment
    timeout: 30000,
    heartbeatIntervalMs: 15000,
  },
});

/**
 * Helper to safely upsert rows to 'poems' table across schema variations.
 * Sequentially strips optional columns if PostgREST throws a 400 bad request.
 */
async function upsertPoemsSafely(rows: any[]): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || rows.length === 0) return { success: false };

  // Attempt 1: Full payload including 'data' JSON and time capsule fields
  const { error: err1 } = await supabase.from('poems').upsert(rows, { onConflict: 'id' });
  if (!err1) return { success: true };

  // Attempt 2: Strip time capsule specific explicit columns
  const noTimeCapsuleRows = rows.map((r) => {
    const { is_time_capsule, unlock_date, ...rest } = r;
    return rest;
  });
  const { error: err2 } = await supabase.from('poems').upsert(noTimeCapsuleRows, { onConflict: 'id' });
  if (!err2) return { success: true };

  // Attempt 3: Strip 'data' JSON column if schema cache lacks jsonb column
  const cleanRows = rows.map((r) => {
    const { data, is_time_capsule, unlock_date, ...rest } = r;
    return rest;
  });
  const { error: err3 } = await supabase.from('poems').upsert(cleanRows, { onConflict: 'id' });
  if (!err3) return { success: true };

  // Attempt 4: Minimal baseline standard columns guarantee
  const minimalRows = rows.map((r) => ({
    id: r.id,
    title: r.title || 'Untitled',
    content: r.content || '',
    author_id: r.author_id || 'neenv',
    updated_at: new Date().toISOString(),
  }));
  const { error: err4 } = await supabase.from('poems').upsert(minimalRows, { onConflict: 'id' });
  if (!err4) return { success: true };

  return { success: false, error: err4.message };
}

/**
 * Fetch all poems from Supabase 'poems' table
 */
export async function fetchPoemsFromSupabase(): Promise<PalimpsestDocument[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('poems').select('*');
    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map((row: any) => {
        const docData =
          row.data && typeof row.data === 'object'
            ? row.data
            : typeof row.data === 'string'
            ? JSON.parse(row.data)
            : {};

        // Merge with initial document template if ID matches
        const initialTemplate: PalimpsestDocument = INITIAL_DOCUMENTS.find((d) => d.id === row.id) || {
          id: row.id,
          title: 'Untitled Poem',
          subtitle: '',
          content: '',
          authorId: 'neenv',
          createdDate: new Date().toISOString(),
          modifiedDate: new Date().toISOString(),
          category: 'poetry',
          mood: 'Serene',
          tags: ['poetry'],
          readingTimeMinutes: 1,
          wordCount: 100,
          characterCount: 500,
          status: 'published' as const,
          permission: 'shared' as const,
          fontStyle: 'Cormorant Garamond',
          fontSize: 18,
          isPinned: false,
          isFavorite: false,
          versions: [],
          annotations: [],
          reactions: [],
          bookmarks: [],
        };

        const resolvedUnlockDate =
          row.unlock_date ||
          row.unlockDate ||
          docData.timeCapsuleUnlockDate ||
          docData.unlockDate ||
          initialTemplate.unlockDate;

        return {
          ...initialTemplate,
          ...docData,

          // Override explicit columns if present on row
          id: row.id || docData.id || initialTemplate.id,
          title: row.title || docData.title || initialTemplate.title,
          content: row.content !== undefined ? row.content : docData.content || initialTemplate.content,
          authorId: row.author_id || row.authorId || docData.authorId || initialTemplate.authorId,
          poetNote: row.poet_note !== undefined ? row.poet_note : row.poetNote !== undefined ? row.poetNote : docData.poetNote ?? initialTemplate.poetNote,
          natashaReflection: row.natasha_reflection !== undefined ? row.natasha_reflection : row.natashaReflection !== undefined ? row.natashaReflection : docData.natashaReflection ?? initialTemplate.natashaReflection,
          category: row.category || docData.category || initialTemplate.category,
          modifiedDate: row.updated_at || row.modifiedDate || docData.modifiedDate || initialTemplate.modifiedDate,
          isFavorite: row.is_favorite !== undefined ? row.is_favorite : row.isFavorite !== undefined ? row.isFavorite : docData.isFavorite ?? initialTemplate.isFavorite,
          isPinned: row.is_pinned !== undefined ? row.is_pinned : row.isPinned !== undefined ? row.isPinned : docData.isPinned ?? initialTemplate.isPinned,
          isTimeCapsule: row.is_time_capsule !== undefined ? row.is_time_capsule : row.isTimeCapsule !== undefined ? row.isTimeCapsule : docData.isTimeCapsule ?? initialTemplate.isTimeCapsule,
          unlockDate: resolvedUnlockDate,
          timeCapsuleUnlockDate: resolvedUnlockDate,
        } as PalimpsestDocument;
      });
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return null;
  }
}

/**
 * Helper to build payload row from PalimpsestDocument
 */
function buildPoemRow(doc: PalimpsestDocument) {
  const unlockDate = doc.timeCapsuleUnlockDate || doc.unlockDate || null;
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    author_id: doc.authorId,
    poet_note: doc.poetNote || null,
    natasha_reflection: doc.natashaReflection || null,
    category: doc.category || 'poetry',
    is_favorite: Boolean(doc.isFavorite),
    is_pinned: Boolean(doc.isPinned),
    is_time_capsule: Boolean(doc.isTimeCapsule),
    unlock_date: unlockDate,
    updated_at: new Date().toISOString(),
    data: {
      ...doc,
      timeCapsuleUnlockDate: unlockDate,
      unlockDate: unlockDate,
    },
  };
}

/**
 * Upsert a single poem to Supabase 'poems' table
 */
export async function upsertPoemToSupabase(doc: PalimpsestDocument): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = buildPoemRow(doc);
    const result = await upsertPoemsSafely([row]);
    if (!result.success) {
      console.error('Supabase upsert failed:', result.error);
    }
    return result.success;
  } catch (err) {
    console.error('Failed to upsert to Supabase:', err);
    return false;
  }
}

/**
 * Seed initial documents if Supabase table is empty
 */
export async function seedInitialPoemsToSupabase(initialDocs: PalimpsestDocument[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const rows = initialDocs.map(buildPoemRow);
    const result = await upsertPoemsSafely(rows);
    if (!result.success) {
      console.warn('Supabase initial seed notice:', result.error);
    }
    return result.success;
  } catch (err) {
    console.error('Failed to seed poems to Supabase:', err);
    return false;
  }
}

/**
 * Delete a poem from Supabase 'poems' table
 */
export async function deletePoemFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('poems').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete poem from Supabase:', err);
    return false;
  }
}

/**
 * Upload image to Supabase Storage bucket 'poem-images'
 */
export async function uploadPoemImageToSupabaseBucket(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('poem-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn('Supabase storage upload warning:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from('poem-images').getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('Failed to upload image to Supabase Storage bucket', err);
    return null;
  }
}