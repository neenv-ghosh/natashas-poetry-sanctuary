import React, { Dispatch, SetStateAction } from 'react';
import {
  Feather,
  Plus,
  BookOpen,
  Pin,
  Clock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Star,
  Layers,
  Heart,
  Camera,
  Mail,
  Archive,
  Trash2,
  PenTool,
} from 'lucide-react';
import { PalimpsestDocument, AuthorProfile, Collection } from '../types';
import { ViewType } from '../App';
import { Bookshelf } from './Bookshelf';
import { LetterEnvelope } from './LetterEnvelope';
import { MemoryLaneWidget } from './MemoryLaneWidget';

interface HomeStudioViewProps {
  documents: PalimpsestDocument[];
  authors: AuthorProfile[];
  currentAuthorId: string;
  collections: Collection[];
  onSelectDocument: (docId: string, mode?: 'read' | 'edit') => void;
  onNewDocument: () => void;
  onSelectCollection: (colId: string) => void;
  // Accepts both standard callbacks and React state setter functions directly
  onChangeView?: Dispatch<SetStateAction<ViewType>> | ((view: ViewType) => void);
  onToggleFavorite?: (docId: string, e: React.MouseEvent) => void;
  onDeleteDocument?: (docId: string, e: React.MouseEvent) => void;
}

export const HomeStudioView: React.FC<HomeStudioViewProps> = ({
  documents,
  authors,
  currentAuthorId,
  collections,
  onSelectDocument,
  onNewDocument,
  onSelectCollection,
  onChangeView,
  onToggleFavorite,
  onDeleteDocument,
}) => {
  const activeDocs = documents.filter((d) => !d.isTrash && !d.status.includes('archive'));
  const pinnedDocs = activeDocs.filter((d) => d.isPinned || d.isFavorite);
  const poetryDocs = activeDocs.filter((d) => d.category.toLowerCase() === 'poetry');
  const lettersDocs = activeDocs.filter((d) => d.category.toLowerCase() === 'letters');
  
  // Collect all photo memories across documents
  const allPhotos = activeDocs.flatMap((d) =>
    (d.photos || []).map((p) => ({ photo: p, doc: d }))
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 font-serif bg-[#fbf8f3] dark:bg-[#181512] text-[#2c241c] dark:text-[#ebdcc8]">
      
      {/* Visual Studio Sanctuary Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#2c241c] via-[#3a2f24] to-[#221a14] text-[#f7e7ce] rounded-2xl shadow-xl relative overflow-hidden border border-[#524434]/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300 font-sans font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Natasha Raman’s Personal Sanctuary</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#faf2e6] font-['Playfair_Display',serif]">
              Natasha’s Desktop Sanctuary
            </h1>
            <p className="font-serif italic text-sm md:text-base text-[#ded0be] leading-relaxed font-['Cormorant_Garamond',serif]">
              "Where Natasha Raman stores, reads, and preserves the poems, stanzas, and letters written for her by Neenv Ghosh."
            </p>
          </div>

          <button
            onClick={onNewDocument}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f7e7ce] text-[#2c241c] font-serif font-bold text-xs hover:bg-[#ffffff] transition-all shadow-md group shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300 text-amber-950" />
            <span>Add Poem from Neenv</span>
          </button>
        </div>
      </div>

      {/* Poem of the Day / Memory Lane Widget */}
      <MemoryLaneWidget documents={documents} onOpenDocument={onSelectDocument} />

      {/* Interactive Physical Objects Toolbar / Desk Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Desk Object 1: Wooden Writing Desk / Parchment */}
        <div
          onClick={onNewDocument}
          className="p-4 bg-[#f6efe4] dark:bg-[#211b16] border border-[#ebd2b4] dark:border-[#382f25] rounded-xl hover:border-amber-700/60 transition-all cursor-pointer group shadow-xs space-y-2"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-900/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-[#2c241c] dark:text-[#ebdcc8]">
              Writing Desk
            </div>
            <div className="text-[11px] font-serif italic text-[#786b58] dark:text-[#a09280]">
              Add new stanza from Neenv
            </div>
          </div>
        </div>

        {/* Desk Object 2: Sealed Envelope Stack */}
        <div
          onClick={() => onChangeView && onChangeView('collections')}
          className="p-4 bg-[#f6efe4] dark:bg-[#211b16] border border-[#ebd2b4] dark:border-[#382f25] rounded-xl hover:border-amber-700/60 transition-all cursor-pointer group shadow-xs space-y-2"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-900/10 dark:bg-rose-500/20 text-rose-900 dark:text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-[#2c241c] dark:text-[#ebdcc8]">
              Sealed Letters ({lettersDocs.length})
            </div>
            <div className="text-[11px] font-serif italic text-[#786b58] dark:text-[#a09280]">
              Folded epistles & notes
            </div>
          </div>
        </div>

        {/* Desk Object 3: Framed Memory Photo Wall */}
        <div
          onClick={() => onChangeView && onChangeView('photos')}
          className="p-4 bg-[#f6efe4] dark:bg-[#211b16] border border-[#ebd2b4] dark:border-[#382f25] rounded-xl hover:border-amber-700/60 transition-all cursor-pointer group shadow-xs space-y-2"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-900/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-[#2c241c] dark:text-[#ebdcc8]">
              Framed Photos ({allPhotos.length})
            </div>
            <div className="text-[11px] font-serif italic text-[#786b58] dark:text-[#a09280]">
              Keepsakes & snapshots
            </div>
          </div>
        </div>

        {/* Desk Object 4: Filing Cabinet Archive */}
        <div
          onClick={() => onChangeView && onChangeView('archive')}
          className="p-4 bg-[#f6efe4] dark:bg-[#211b16] border border-[#ebd2b4] dark:border-[#382f25] rounded-xl hover:border-amber-700/60 transition-all cursor-pointer group shadow-xs space-y-2"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-800/10 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-[#2c241c] dark:text-[#ebdcc8]">
              Filing Cabinet
            </div>
            <div className="text-[11px] font-serif italic text-[#786b58] dark:text-[#a09280]">
              Archived manuscript drafts
            </div>
          </div>
        </div>
      </div>

      {/* Main Bookshelf: Natasha's Favorite & Pinned Volumes */}
      <Bookshelf
        title="Natasha’s Favorites & Pinned Volumes"
        subtitle="The stanzas and poems held closest to heart."
        documents={pinnedDocs.length > 0 ? pinnedDocs : activeDocs.slice(0, 4)}
        onOpenDocument={onSelectDocument}
        onToggleFavorite={onToggleFavorite}
        onDeleteDocument={onDeleteDocument}
        accentColor="#b45309"
        emptyStateText="This shelf is waiting for its first story from Neenv."
      />

      {/* Secondary Bookshelf: Complete Poetry Collection */}
      <Bookshelf
        title="Poetry Shelf & Living Manuscripts"
        subtitle="Every stanza penned by Neenv, preserved in leather-bound volumes."
        documents={poetryDocs.length > 0 ? poetryDocs : activeDocs}
        onOpenDocument={onSelectDocument}
        onToggleFavorite={onToggleFavorite}
        onDeleteDocument={onDeleteDocument}
        accentColor="#881337"
        emptyStateText="No poetry volumes resting on this shelf yet."
      />

      {/* Sealed Letters Section */}
      {lettersDocs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#d6c4ae] dark:border-[#382f25] pb-2">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#2c241c] dark:text-[#ebdcc8] font-['Playfair_Display',serif]">
                Sealed Letters & Epistles
              </h2>
              <p className="font-serif italic text-xs text-[#786b58] dark:text-[#a09280]">
                "Unfold and read Neenv's letters written across days and evenings."
              </p>
            </div>
            <span className="text-xs font-sans uppercase tracking-widest text-amber-900 font-bold px-2.5 py-1 bg-[#efe6d8] dark:bg-[#251f19] rounded-md">
              {lettersDocs.length} Epistles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {lettersDocs.map((letter) => (
              <LetterEnvelope
                key={letter.id}
                document={letter}
                onOpen={onSelectDocument}
                onToggleFavorite={onToggleFavorite}
                onDeleteDocument={onDeleteDocument}
              />
            ))}
          </div>
        </section>
      )}

      {/* Framed Photos Wall Preview */}
      {allPhotos.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#d6c4ae] dark:border-[#382f25] pb-2">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#2c241c] dark:text-[#ebdcc8] font-['Playfair_Display',serif] flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-800" />
                <span>Framed Photo Keepsakes Wall</span>
              </h2>
              <p className="font-serif italic text-xs text-[#786b58] dark:text-[#a09280]">
                "Photos preserved alongside stanzas and stanzas preserved alongside memories."
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChangeView && onChangeView('photos')}
              className="text-xs font-serif italic text-amber-900 dark:text-amber-300 hover:underline cursor-pointer"
            >
              View All Photos &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allPhotos.slice(0, 4).map(({ photo, doc }) => (
              <div
                key={photo.id}
                onClick={() => onSelectDocument(doc.id)}
                className="bg-[#ffffff] dark:bg-[#1f1b17] p-2.5 rounded-xl border-4 border-[#e5d8c8] dark:border-[#382f25] shadow-md hover:shadow-xl transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="aspect-4/3 rounded overflow-hidden bg-black/10 relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Memory'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {photo.caption && (
                  <p className="font-serif italic text-[11px] text-[#2c241c] dark:text-[#ebdcc8] truncate text-center">
                    "{photo.caption}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};