import {
  AuthorProfile,
  Collection,
  DocumentVersion,
  PalimpsestDocument,
  ThemeMode,
  UserStats,
} from '../types';
import { DEFAULT_COLLECTIONS, INITIAL_AUTHORS, INITIAL_DOCUMENTS } from '../data/initialData';
import {
  fetchPoemsFromSupabase,
  upsertPoemToSupabase,
  deletePoemFromSupabase,
  seedInitialPoemsToSupabase,
  isSupabaseConfigured,
} from './supabase';

const DOCS_KEY = 'palimpsest_documents_v1';
const AUTHORS_KEY = 'palimpsest_authors_v1';
const COLLECTIONS_KEY = 'palimpsest_collections_v1';
const THEME_KEY = 'palimpsest_theme_v1';
const CURRENT_AUTHOR_KEY = 'palimpsest_current_author_v1';

export class StorageService {
  public static getDocuments(): PalimpsestDocument[] {
    try {
      const data = localStorage.getItem(DOCS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load documents from localStorage', e);
    }
    // Default seed
    this.saveDocuments(INITIAL_DOCUMENTS);
    return INITIAL_DOCUMENTS;
  }

  public static saveDocuments(docs: PalimpsestDocument[]): void {
    try {
      localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save documents to localStorage', e);
    }
  }

  public static async syncWithSupabase(): Promise<PalimpsestDocument[]> {
    if (!isSupabaseConfigured()) {
      return this.getDocuments();
    }
    try {
      const remoteDocs = await fetchPoemsFromSupabase();
      if (remoteDocs === null) {
        return this.getDocuments();
      }
      if (remoteDocs.length === 0) {
        // Seed initial documents to Supabase if table is empty
        await seedInitialPoemsToSupabase(INITIAL_DOCUMENTS);
        this.saveDocuments(INITIAL_DOCUMENTS);
        return INITIAL_DOCUMENTS;
      }
      this.saveDocuments(remoteDocs);
      return remoteDocs;
    } catch (err) {
      console.error('Supabase sync failed, falling back to local storage', err);
      return this.getDocuments();
    }
  }

  public static getDocumentById(id: string): PalimpsestDocument | undefined {
    const docs = this.getDocuments();
    return docs.find((d) => d.id === id);
  }

  public static saveDocument(doc: PalimpsestDocument): void {
    const docs = this.getDocuments();
    const index = docs.findIndex((d) => d.id === doc.id);

    // Calculate metadata word and character count
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = doc.content || '';
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    const characters = plainText.length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));

    const updatedDoc: PalimpsestDocument = {
      ...doc,
      wordCount: words,
      characterCount: characters,
      readingTimeMinutes: readingMinutes,
      modifiedDate: new Date().toISOString(),
    };

    if (index >= 0) {
      docs[index] = updatedDoc;
    } else {
      docs.unshift(updatedDoc);
    }

    this.saveDocuments(docs);

    // Async sync to Supabase
    upsertPoemToSupabase(updatedDoc).catch((e) =>
      console.warn('Background Supabase upsert error:', e)
    );
  }

  public static createNewVersion(
    docId: string,
    authorId: string,
    changeSummary: string
  ): PalimpsestDocument | undefined {
    const doc = this.getDocumentById(docId);
    if (!doc) return undefined;

    const newVersionNum = (doc.versions?.length || 0) + 1;
    const newVersion: DocumentVersion = {
      versionNumber: newVersionNum,
      authorId,
      timestamp: new Date().toISOString(),
      changeSummary: changeSummary || `Version ${newVersionNum} created`,
      title: doc.title,
      subtitle: doc.subtitle,
      content: doc.content,
    };

    const updatedDoc: PalimpsestDocument = {
      ...doc,
      versions: [newVersion, ...(doc.versions || [])],
      modifiedDate: new Date().toISOString(),
    };

    this.saveDocument(updatedDoc);
    return updatedDoc;
  }

  public static restoreVersion(docId: string, versionNumber: number): PalimpsestDocument | undefined {
    const doc = this.getDocumentById(docId);
    if (!doc) return undefined;

    const targetVersion = doc.versions.find((v) => v.versionNumber === versionNumber);
    if (!targetVersion) return undefined;

    const restoredDoc: PalimpsestDocument = {
      ...doc,
      title: targetVersion.title,
      subtitle: targetVersion.subtitle,
      content: targetVersion.content,
      modifiedDate: new Date().toISOString(),
    };

    // Also record a restore version snapshot
    return this.createNewVersion(docId, targetVersion.authorId, `Restored from version ${versionNumber}`);
  }

  public static deleteDocument(id: string, permanent = false): void {
    let docs = this.getDocuments();
    const target = docs.find((d) => d.id === id);
    if (permanent) {
      docs = docs.filter((d) => d.id !== id);
      deletePoemFromSupabase(id).catch((e) => console.warn('Supabase delete error:', e));
    } else if (target) {
      const softDeleted = { ...target, isTrash: true };
      docs = docs.map((d) => (d.id === id ? softDeleted : d));
      upsertPoemToSupabase(softDeleted).catch((e) => console.warn('Supabase soft delete error:', e));
    }
    this.saveDocuments(docs);
  }

  public static restoreDocumentFromTrash(id: string): void {
    const docs = this.getDocuments();
    const target = docs.find((d) => d.id === id);
    if (target) {
      const restored = { ...target, isTrash: false };
      const updatedDocs = docs.map((d) => (d.id === id ? restored : d));
      this.saveDocuments(updatedDocs);
      upsertPoemToSupabase(restored).catch((e) => console.warn('Supabase restore error:', e));
    }
  }

  public static getAuthors(): AuthorProfile[] {
    try {
      const data = localStorage.getItem(AUTHORS_KEY);
      if (data) {
        const parsed: AuthorProfile[] = JSON.parse(data);
        if (parsed.length >= 2) {
          return parsed;
        }
      }
    } catch {}
    this.saveAuthors(INITIAL_AUTHORS);
    return INITIAL_AUTHORS;
  }

  public static saveAuthors(authors: AuthorProfile[]): void {
    localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors));
  }

  public static getCurrentAuthorId(): string {
    const id = localStorage.getItem(CURRENT_AUTHOR_KEY);
    if (id === 'author-neenv' || id === 'author-natasha') return id;
    this.setCurrentAuthorId('author-neenv');
    return 'author-neenv';
  }

  public static setCurrentAuthorId(id: string): void {
    localStorage.setItem(CURRENT_AUTHOR_KEY, id);
  }

  public static getCollections(): Collection[] {
    try {
      const data = localStorage.getItem(COLLECTIONS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveCollections(DEFAULT_COLLECTIONS);
    return DEFAULT_COLLECTIONS;
  }

  public static saveCollections(collections: Collection[]): void {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }

  public static getTheme(): ThemeMode {
    const t = localStorage.getItem(THEME_KEY) as ThemeMode;
    return t || 'sepia';
  }

  public static setTheme(theme: ThemeMode): void {
    localStorage.setItem(THEME_KEY, theme);
  }

  public static calculateUserStats(): UserStats {
    const docs = this.getDocuments().filter((d) => !d.isTrash);
    let totalWords = 0;
    let longestTitle = 'None';
    let longestWordCount = 0;
    let mostAnnotatedTitle = 'None';
    let mostAnnotatedCount = 0;
    let totalReadingMinutes = 0;

    const collectionCounts: Record<string, number> = {};

    docs.forEach((doc) => {
      totalWords += doc.wordCount || 0;
      totalReadingMinutes += doc.readingTimeMinutes || 0;

      if (doc.wordCount > longestWordCount) {
        longestWordCount = doc.wordCount;
        longestTitle = doc.title;
      }

      const totalAnn = doc.annotations?.length || 0;
      if (totalAnn > mostAnnotatedCount) {
        mostAnnotatedCount = totalAnn;
        mostAnnotatedTitle = doc.title;
      }

      const cat = doc.category || 'uncategorized';
      collectionCounts[cat] = (collectionCounts[cat] || 0) + 1;
    });

    let favoriteCollection = 'Poetry';
    let maxCatCount = 0;
    Object.entries(collectionCounts).forEach(([cat, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        favoriteCollection = cat.charAt(0).toUpperCase() + cat.slice(1);
      }
    });

    return {
      totalPoems: docs.length,
      totalWords,
      longestPoemTitle: longestTitle,
      longestPoemWordCount: longestWordCount,
      writingStreakDays: 14, // Living active streak
      mostAnnotatedPoemTitle: mostAnnotatedTitle,
      mostAnnotatedCount: mostAnnotatedCount,
      favoriteCollection,
      totalReadingMinutes,
      dailyWordHistory: [
        { date: 'Mon', wordCount: 320 },
        { date: 'Tue', wordCount: 540 },
        { date: 'Wed', wordCount: 280 },
        { date: 'Thu', wordCount: 710 },
        { date: 'Fri', wordCount: 450 },
        { date: 'Sat', wordCount: 890 },
        { date: 'Sun', wordCount: 620 },
      ],
    };
  }

  // Export Utilities
  public static exportAsPlainText(doc: PalimpsestDocument): void {
    const temp = document.createElement('div');
    temp.innerHTML = doc.content;
    const text = `${doc.title.toUpperCase()}\n${doc.subtitle ? doc.subtitle + '\n' : ''}\nBy ${doc.authorId}\nDate: ${new Date(doc.createdDate).toLocaleDateString()}\n----------------------------------------\n\n${temp.textContent || temp.innerText}`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    this.downloadFile(blob, `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
  }

  public static exportAsMarkdown(doc: PalimpsestDocument): void {
    const temp = document.createElement('div');
    temp.innerHTML = doc.content;
    const mdText = `# ${doc.title}\n*${doc.subtitle || ''}*\n\n**Author:** ${doc.authorId}  \n**Date:** ${new Date(doc.createdDate).toLocaleDateString()}  \n**Mood:** ${doc.mood}  \n**Tags:** ${doc.tags.join(', ')}\n\n---\n\n${doc.content
      .replace(/<h2>/g, '## ')
      .replace(/<\/h2>/g, '\n\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<em>/g, '*')
      .replace(/<\/em>/g, '*')
      .replace(/<hr>/g, '---\n')}`;

    const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
    this.downloadFile(blob, `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
  }

  public static exportAsHTML(doc: PalimpsestDocument): void {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 20px; color: #2c2621; background: #fcfaf7; }
    h1 { font-family: 'Playfair Display', serif; font-size: 2.5em; margin-bottom: 0.2em; color: #1c1917; }
    .subtitle { font-style: italic; color: #78716c; font-size: 1.2em; margin-bottom: 2em; }
    .meta { font-size: 0.9em; color: #a8a29e; border-bottom: 1px solid #e7e5e4; padding-bottom: 12px; margin-bottom: 2em; }
    p { margin-bottom: 1.5em; }
  </style>
</head>
<body>
  <h1>${doc.title}</h1>
  ${doc.subtitle ? `<div class="subtitle">${doc.subtitle}</div>` : ''}
  <div class="meta">Written on ${new Date(doc.createdDate).toLocaleDateString()} &bull; Mood: ${doc.mood}</div>
  <div class="content">
    ${doc.content}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    this.downloadFile(blob, `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`);
  }

  public static clearAllDocuments(): void {
    try {
      localStorage.setItem(DOCS_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear documents in localStorage', e);
    }
  }

  public static exportBackupJSON(): void {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      documents: this.getDocuments(),
      authors: this.getAuthors(),
      collections: this.getCollections(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, `palimpsest_manuscript_backup_${new Date().toISOString().split('T')[0]}.json`);
  }

  public static importBackupJSON(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.documents && Array.isArray(parsed.documents)) {
        this.saveDocuments(parsed.documents);
      }
      if (parsed.authors && Array.isArray(parsed.authors)) {
        this.saveAuthors(parsed.authors);
      }
      if (parsed.collections && Array.isArray(parsed.collections)) {
        this.saveCollections(parsed.collections);
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  }

  private static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
