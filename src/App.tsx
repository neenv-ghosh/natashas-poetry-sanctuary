import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { SplashScreen } from './components/SplashScreen';
import { NavigationSidebar } from './components/NavigationSidebar';
import { PresenceHeaderBar } from './components/PresenceHeaderBar';
import { LiveReactionOverlay } from './components/LiveReactionOverlay';
import { HomeStudioView } from './components/HomeStudioView';
import { RichEditor } from './components/RichEditor';
import { MarginAnnotationsPanel } from './components/MarginAnnotationsPanel';
import { ReadingMode } from './components/ReadingMode';
import { FocusMode } from './components/FocusMode';
import { CollectionsView } from './components/CollectionsView';
import { PhotoGalleryView } from './components/PhotoGalleryView';
import { StatisticsView } from './components/StatisticsView';
import { SearchModal } from './components/SearchModal';
import { SettingsModal } from './components/SettingsModal';
import TitleBar from './components/TitleBar';
import { StorageService } from './services/storageService';
import { ambientAudioService } from './services/ambientAudioService';
import { supabase, isSupabaseConfigured, upsertPoemToSupabase } from './services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  AuthorProfile,
  Collection,
  CollectionCategory,
  PalimpsestDocument,
  ThemeMode,
  AmbientSoundType,
  UserPresenceState,
  LiveReactionPing,
} from './types';
import { Menu, X, Star, Archive, Trash2, RotateCcw } from 'lucide-react';

export type ViewType =
  | 'home'
  | 'editor'
  | 'reading'
  | 'focus'
  | 'collections'
  | 'collection_detail'
  | 'photos'
  | 'favorites'
  | 'archive'
  | 'trash'
  | 'statistics'
  | 'settings';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [documents, setDocuments] = useState<PalimpsestDocument[]>([]);
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentAuthorId, setCurrentAuthorId] = useState<string>('');
  const [theme, setTheme] = useState<ThemeMode>('sepia');
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');

  // Network connection status state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Navigation & View state
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string | undefined>(undefined);

  // Panels & Modals
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightMarginOpen, setRightMarginOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Supabase Realtime & Presence State
  const [partnerPresence, setPartnerPresence] = useState<UserPresenceState | null>(null);
  const [recentReactions, setRecentReactions] = useState<LiveReactionPing[]>([]);

  // Ref to store presence channel so broadcasting doesn't tear down/reconnect channels
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  
  // Ref for debouncing Supabase updates to prevent keystroke truncation
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep activeDocId in a ref so realtime listeners can inspect it without stale closures
  const activeDocIdRef = useRef<string | null>(activeDocId);
  useEffect(() => {
    activeDocIdRef.current = activeDocId;
  }, [activeDocId]);

  // Listen for real-time online/offline network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Connection restored. Re-syncing with Supabase...');
      StorageService.syncWithSupabase();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Connection lost. Switching entirely to local storage mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load initial state & Sync with Supabase
  useEffect(() => {
    const loadedDocs = StorageService.getDocuments();
    const loadedAuthors = StorageService.getAuthors();
    const loadedCols = StorageService.getCollections();
    const loadedAuthorId = StorageService.getCurrentAuthorId();
    const loadedTheme = StorageService.getTheme();

    setDocuments(loadedDocs);
    setAuthors(loadedAuthors);
    setCollections(loadedCols);
    setCurrentAuthorId(loadedAuthorId);
    setTheme(loadedTheme);

    if (loadedDocs.length > 0) {
      setActiveDocId(loadedDocs[0].id);
    }

    StorageService.syncWithSupabase().then((syncedDocs) => {
      if (syncedDocs && syncedDocs.length > 0) {
        setDocuments(syncedDocs);
      }
    });
  }, []);

  const currentAuthor = authors.find((a) => a.id === currentAuthorId) || authors[0] || {
    id: 'author-natasha',
    name: 'Natasha Raman',
    title: 'Sanctuary Custodian & Muse',
    avatarColor: '#b45309',
    penColor: '#d97706',
    bio: 'Keeper of Neenv’s poems, memory photos, reflections, and quiet stanzas.',
  };

  const partnerAuthor = authors.find((a) => a.id !== currentAuthorId) || {
    id: 'author-neenv',
    name: 'Neenv Ghosh',
    title: 'Poet & Dedicated Writer',
    avatarColor: '#881337',
    penColor: '#9f1239',
    bio: 'Writing poems, stanzas, and letters forever dedicated to Natasha Raman.',
  };

  const activeDocument = documents.find((d) => d.id === activeDocId) || documents[0] || null;

  // 1. Postgres Realtime Subscription (Database Listener with active typing protection guard)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const poemsChannel = supabase
      .channel('public:poems')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'poems' },
        (payload) => {
          console.log('🔥 REALTIME UPDATE RECEIVED:', payload);

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row: any = payload.new;
            const docData =
              row.data && typeof row.data === 'object'
                ? row.data
                : typeof row.data === 'string'
                ? JSON.parse(row.data)
                : {};

            const updatedPoem: PalimpsestDocument = {
              ...docData,
              id: row.id || docData.id,
              title: row.title || docData.title,
              content: row.content !== undefined ? row.content : docData.content,
              modifiedDate: row.updated_at || docData.modifiedDate || new Date().toISOString(),
            };

            setDocuments((prevDocs) => {
              const index = prevDocs.findIndex((d) => d.id === updatedPoem.id);
              if (index >= 0) {
                // GUARD: If this is the active document currently being edited locally,
                // ignore remote updates that are older or identical to prevent cursor/text clipping.
                if (updatedPoem.id === activeDocIdRef.current) {
                  const localDoc = prevDocs[index];
                  const remoteTime = new Date(updatedPoem.modifiedDate).getTime();
                  const localTime = new Date(localDoc.modifiedDate).getTime();

                  if (remoteTime < localTime) {
                    return prevDocs;
                  }
                }

                const newDocs = [...prevDocs];
                newDocs[index] = {
                  ...prevDocs[index],
                  ...updatedPoem,
                };
                return newDocs;
              }
              return [updatedPoem, ...prevDocs];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setDocuments((prevDocs) => prevDocs.filter((d) => d.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(poemsChannel);
    };
  }, []);

  // 2. Setup Persistent Presence & Broadcast Channel (Created Once)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase.channel('sanctuary-presence', {
      config: { presence: { key: currentAuthor.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const partnerKey = partnerAuthor.id;
        const partnerPresences = state[partnerKey];

        if (partnerPresences && partnerPresences.length > 0) {
          setPartnerPresence(partnerPresences[0] as unknown as UserPresenceState);
        } else {
          setPartnerPresence(null);
        }
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (payload?.emoji) {
          const ping: LiveReactionPing = {
            id: `ping-${Date.now()}-${Math.random()}`,
            emoji: payload.emoji,
            fromUser: payload.fromUser || partnerAuthor.name,
            poemId: payload.poemId,
            poemTitle: payload.poemTitle,
            timestamp: Date.now(),
          };
          setRecentReactions((prev) => [...prev, ping]);
        }
      })
      .subscribe();

    presenceChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      presenceChannelRef.current = null;
    };
  }, [currentAuthor.id, partnerAuthor.id, partnerAuthor.name]);

  // 3. Track Presence Updates Without Recreating Socket Connection
  useEffect(() => {
    if (!isSupabaseConfigured() || !presenceChannelRef.current) return;

    presenceChannelRef.current.track({
      user: currentAuthor,
      activePoemId: activeDocId,
      activePoemTitle: activeDocument?.title || null,
      currentView,
      lastSeen: new Date().toISOString(),
    });
  }, [currentAuthor, activeDocId, activeDocument?.title, currentView]);

  // Global Theme CSS class setter
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia-theme', 'library-theme', 'night-theme', 'rain-theme', 'christmas-theme');

    if (['dark', 'library', 'night', 'rain', 'christmas'].includes(theme)) {
      root.classList.add('dark');
    }
  }, [theme]);

  // Handlers
  const handleTeleportToPoem = (poemId: string, viewMode: 'read' | 'edit' = 'read') => {
    const targetDoc = documents.find((d) => d.id === poemId);
    if (targetDoc) {
      setActiveDocId(poemId);
      setCurrentView(viewMode === 'read' ? 'reading' : 'editor');
    }
  };

  const handleSendReactionPing = (emoji: string) => {
    if (!isSupabaseConfigured() || !presenceChannelRef.current) return;

    const pingPayload = {
      emoji,
      fromUser: currentAuthor.name,
      poemId: activeDocId,
      poemTitle: activeDocument?.title || 'Sanctuary Poem',
    };

    presenceChannelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: pingPayload,
    });

    const localPing: LiveReactionPing = {
      id: `ping-${Date.now()}-${Math.random()}`,
      emoji,
      fromUser: currentAuthor.name,
      poemId: activeDocId || 'sanctuary',
      poemTitle: activeDocument?.title || 'Sanctuary Poem',
      timestamp: Date.now(),
    };
    setRecentReactions((prev) => [...prev, localPing]);
  };

  const handleUpdateDocument = async (updatedDoc: PalimpsestDocument) => {
    // 1. Instantly update local React state & localStorage for buttery smooth typing
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
    StorageService.saveDocument(updatedDoc);

    // 2. If offline, bypass Supabase cloud syncing entirely
    if (!isOnline) {
      return;
    }

    // 3. Clear any pending debounced sync to Supabase
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 4. Debounce network sync by 800ms so fast keystrokes don't get interrupted or truncated
    saveTimeoutRef.current = setTimeout(async () => {
      if (isSupabaseConfigured()) {
        try {
          await upsertPoemToSupabase(updatedDoc);
        } catch (err) {
          console.error('Failed to update document on Supabase:', err);
        }
      }
    }, 800);
  };

  const handleToggleFavorite = (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = documents.find((d) => d.id === docId);
    if (!target) return;
    handleUpdateDocument({ ...target, isFavorite: !target.isFavorite });
  };

  const handleDeleteDocument = async (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    StorageService.deleteDocument(docId, false);
    const updatedDocs = StorageService.getDocuments();
    setDocuments(updatedDocs);

    if (isSupabaseConfigured() && isOnline) {
      await supabase.from('poems').delete().eq('id', docId);
    }

    if (activeDocId === docId) {
      const remaining = updatedDocs.filter((d) => !d.isTrash);
      setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateCollection = (updatedCol: Collection) => {
    const updatedCols = collections.map((c) => (c.id === updatedCol.id ? updatedCol : c));
    setCollections(updatedCols);
    StorageService.saveCollections(updatedCols);
  };

  const handleDeleteCollection = (colId: string) => {
    const updatedCols = collections.filter((c) => c.id !== colId);
    setCollections(updatedCols);
    StorageService.saveCollections(updatedCols);
  };

  const handleRestoreVersion = (versionNum: number) => {
    if (!activeDocId) return;
    const restored = StorageService.restoreVersion(activeDocId, versionNum);
    if (restored) {
      const allDocs = StorageService.getDocuments();
      setDocuments(allDocs);
      const restoredDoc = allDocs.find((d) => d.id === activeDocId);
      if (restoredDoc) handleUpdateDocument(restoredDoc);
    }
  };

  const handleCreateNewDocument = (category: CollectionCategory = 'poetry') => {
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const newDoc: PalimpsestDocument = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Poem from Neenv',
      subtitle: 'Dedicated to Natasha Raman',
      content: '<p>Paste or type Neenv’s poem here...</p>',
      authorId: 'author-neenv',
      coAuthorId: 'author-natasha',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      writtenDateFormatted: todayFormatted,
      dedicatedTo: 'Natasha Raman',
      poetNote: '',
      natashaReflection: '',
      category,
      mood: 'Luminous',
      tags: ['Poem for Natasha'],
      readingTimeMinutes: 1,
      wordCount: 5,
      characterCount: 30,
      status: 'draft',
      permission: 'collaborative',
      fontStyle: "'Cormorant Garamond', serif",
      fontSize: 20,
      isPinned: false,
      isFavorite: false,
      photos: [],
      versions: [],
      annotations: [],
      reactions: [],
      bookmarks: [],
    };

    handleUpdateDocument(newDoc);
    setActiveDocId(newDoc.id);
    setCurrentView('editor');
  };

  const handleSelectDocument = (docId: string) => {
    setActiveDocId(docId);
    setCurrentView('editor');
  };

  const handleSelectCollection = (colId: string) => {
    setActiveCollectionId(colId);
    setCurrentView('collections');
  };

  const handleSwitchAuthor = (authorId: string) => {
    setCurrentAuthorId(authorId);
    StorageService.setCurrentAuthorId(authorId);
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    StorageService.setTheme(newTheme);
  };

  const handleAmbientSoundChange = (type: AmbientSoundType) => {
    setAmbientSound(type);
    ambientAudioService.playSound(type);
  };

  const favoriteDocs = documents.filter((d) => d.isFavorite && !d.isTrash);
  const archiveDocs = documents.filter((d) => d.status === 'archived' && !d.isTrash);
  const trashDocs = documents.filter((d) => d.isTrash);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#fbf8f3] dark:bg-[#181512] text-[#2c241c] dark:text-[#ebdcc8] font-serif">
      {/* Custom Draggable Window Title Bar */}
      <TitleBar />

      <div className="flex flex-1 h-full min-h-0 overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-9 left-0 right-0 z-30 flex items-center justify-between p-3 bg-[#f6f2ea] dark:bg-[#1f1b17] border-b border-[#e8dfd1] dark:border-[#2d2720]">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="p-1.5 rounded-lg bg-[#efe6d8] dark:bg-[#28221c]"
          >
            {leftSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <span className="font-serif font-bold text-sm tracking-widest font-['Cinzel',serif]">
            PALIMPSEST
          </span>

          <button
            onClick={() => setRightMarginOpen(!rightMarginOpen)}
            className="p-1.5 rounded-lg bg-[#efe6d8] dark:bg-[#28221c]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sidebar */}
        <NavigationSidebar
          currentView={currentView}
          onChangeView={setCurrentView}
          collections={collections}
          activeCollectionId={activeCollectionId}
          onSelectCollection={handleSelectCollection}
          authors={authors}
          currentAuthorId={currentAuthorId}
          onSwitchAuthor={handleSwitchAuthor}
          onNewDocument={() => handleCreateNewDocument()}
          onOpenSearch={() => setShowSearchModal(true)}
          ambientSound={ambientSound}
          onChangeAmbientSound={handleAmbientSoundChange}
          isOpen={leftSidebarOpen}
          onToggleOpen={() => setLeftSidebarOpen(!leftSidebarOpen)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pt-12 md:pt-0 relative">
          <PresenceHeaderBar
            currentAuthor={currentAuthor}
            allAuthors={authors}
            onSelectAuthor={handleSwitchAuthor}
            partnerPresence={partnerPresence}
            onTeleportToPoem={handleTeleportToPoem}
            isSupabaseActive={isSupabaseConfigured() && isOnline}
          />

          {/* Home Studio */}
          {currentView === 'home' && (
            <HomeStudioView
              documents={documents}
              authors={authors}
              currentAuthorId={currentAuthorId}
              collections={collections}
              onSelectDocument={handleSelectDocument}
              onNewDocument={() => handleCreateNewDocument()}
              onSelectCollection={handleSelectCollection}
              onChangeView={setCurrentView}
              onToggleFavorite={handleToggleFavorite}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {/* Editor */}
          {currentView === 'editor' && activeDocument && (
            <div className="flex-1 flex h-full min-h-0 overflow-hidden">
              <RichEditor
                document={activeDocument}
                currentAuthor={currentAuthor}
                coAuthor={partnerAuthor}
                onUpdateDocument={handleUpdateDocument}
                onDeleteDocument={handleDeleteDocument}
                onEnterReadingMode={() => setCurrentView('reading')}
                onEnterFocusMode={() => setCurrentView('focus')}
                onOpenMarginPanel={() => setRightMarginOpen(true)}
              />

              <MarginAnnotationsPanel
                document={activeDocument}
                authors={authors}
                currentAuthorId={currentAuthorId}
                collections={collections}
                onUpdateDocument={handleUpdateDocument}
                onRestoreVersion={handleRestoreVersion}
                isOpen={rightMarginOpen}
                onClose={() => setRightMarginOpen(false)}
              />
            </div>
          )}

          {/* Reading Mode */}
          {currentView === 'reading' && activeDocument && (
            <ReadingMode
              document={activeDocument}
              authors={authors}
              allDocuments={documents.filter((d) => !d.isTrash)}
              onSelectDocument={(id) => setActiveDocId(id)}
              onExit={() => setCurrentView('editor')}
              ambientSound={ambientSound}
              onChangeAmbientSound={handleAmbientSoundChange}
              onToggleBookmark={(snippet) => {
                const newBm = {
                  id: `bm-${Date.now()}`,
                  docId: activeDocument.id,
                  textSnippet: snippet,
                  authorId: currentAuthorId,
                  createdAt: new Date().toISOString(),
                };
                handleUpdateDocument({
                  ...activeDocument,
                  bookmarks: [...(activeDocument.bookmarks || []), newBm],
                });
              }}
            />
          )}

          {/* Focus Mode */}
          {currentView === 'focus' && activeDocument && (
            <FocusMode
              document={activeDocument}
              currentAuthor={currentAuthor}
              onUpdateDocument={handleUpdateDocument}
              onExit={() => setCurrentView('editor')}
              ambientSound={ambientSound}
              onChangeAmbientSound={handleAmbientSoundChange}
            />
          )}

          {/* Collections */}
          {currentView === 'collections' && (
            <CollectionsView
              collections={collections}
              documents={documents}
              activeCollectionId={activeCollectionId}
              onSelectCollection={(id) => setActiveCollectionId(id)}
              onSelectDocument={handleSelectDocument}
              onCreateCollection={(newCol) => {
                const updated = [...collections, newCol];
                setCollections(updated);
                StorageService.saveCollections(updated);
              }}
              onUpdateCollection={handleUpdateCollection}
              onDeleteCollection={handleDeleteCollection}
              onNewDocumentInCollection={(cat) => handleCreateNewDocument(cat)}
              onToggleFavorite={handleToggleFavorite}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {/* Photo Gallery */}
          {currentView === 'photos' && (
            <PhotoGalleryView
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onUpdateDocument={handleUpdateDocument}
            />
          )}

          {/* Favorites */}
          {currentView === 'favorites' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="border-b border-[#e8dfd1] dark:border-[#2d2720] pb-3">
                <h1 className="text-3xl font-bold font-['Playfair_Display',serif] flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
                  <span>Favorite Manuscripts</span>
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteDocs.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[#8c7e6b] italic">
                    No favorite manuscripts marked yet.
                  </div>
                ) : (
                  favoriteDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDocument(doc.id)}
                      className="p-5 bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#e8dfd1] dark:border-[#332c24] hover:border-amber-800/40 rounded-2xl transition-all cursor-pointer space-y-2 shadow-2xs"
                    >
                      <h3 className="font-bold text-lg text-[#1c1917] dark:text-[#ebdcc8] font-['Playfair_Display',serif]">
                        {doc.title}
                      </h3>
                      {doc.subtitle && (
                        <p className="italic text-xs text-[#615343] dark:text-[#a89a87]">
                          {doc.subtitle}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Archive */}
          {currentView === 'archive' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="border-b border-[#e8dfd1] dark:border-[#2d2720] pb-3">
                <h1 className="text-3xl font-bold font-['Playfair_Display',serif] flex items-center gap-2">
                  <Archive className="w-6 h-6 text-amber-800" />
                  <span>Archived Manuscripts</span>
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archiveDocs.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[#8c7e6b] italic">
                    No archived manuscripts.
                  </div>
                ) : (
                  archiveDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDocument(doc.id)}
                      className="p-5 bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#e8dfd1] dark:border-[#332c24] hover:border-amber-800/40 rounded-2xl transition-all cursor-pointer space-y-2"
                    >
                      <h3 className="font-bold text-lg text-[#1c1917] dark:text-[#ebdcc8] font-['Playfair_Display',serif]">
                        {doc.title}
                      </h3>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Trash */}
          {currentView === 'trash' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="border-b border-[#e8dfd1] dark:border-[#2d2720] pb-3">
                <h1 className="text-3xl font-bold font-['Playfair_Display',serif] flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-600" />
                  <span>Trash Bin</span>
                </h1>
              </div>

              <div className="space-y-3">
                {trashDocs.length === 0 ? (
                  <div className="py-12 text-center text-[#8c7e6b] italic">Trash is empty.</div>
                ) : (
                  trashDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#e8dfd1] dark:border-[#332c24] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-base">{doc.title}</div>
                        <div className="text-xs text-[#8c7e6b]">Deleted stanza</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            StorageService.restoreDocumentFromTrash(doc.id);
                            const restoredDocs = StorageService.getDocuments();
                            setDocuments(restoredDocs);
                            const docToRestore = restoredDocs.find((d) => d.id === doc.id);
                            if (docToRestore) {
                              handleUpdateDocument(docToRestore);
                            }
                          }}
                          className="px-3 py-1 bg-[#efe6d8] dark:bg-[#28221c] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => {
                            StorageService.deleteDocument(doc.id, true);
                            setDocuments(StorageService.getDocuments());
                          }}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold cursor-pointer"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          {currentView === 'statistics' && <StatisticsView />}

          {/* Settings Modal */}
          {currentView === 'settings' && (
            <SettingsModal
              theme={theme}
              onChangeTheme={handleThemeChange}
              authors={authors}
              onUpdateAuthors={(auths) => setAuthors(auths)}
              activeDocument={activeDocument || undefined}
              onClose={() => setCurrentView('home')}
            />
          )}

          {/* Search Modal */}
          {showSearchModal && (
            <SearchModal
              documents={documents}
              authors={authors}
              onSelectDocument={handleSelectDocument}
              onClose={() => setShowSearchModal(false)}
            />
          )}
        </main>
      </div>

      {/* Realtime Reactions Overlay */}
      <LiveReactionOverlay
        poemId={activeDocId || 'sanctuary'}
        poemTitle={activeDocument?.title || 'Sanctuary Poem'}
        currentAuthorName={currentAuthor.name}
        recentReactions={recentReactions}
        onSendReaction={handleSendReactionPing}
        isRightPanelOpen={rightMarginOpen}
      />
    </div>
  );
}