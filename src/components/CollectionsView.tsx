import React, { useState } from 'react';
import {
  Feather,
  Plus,
  FolderHeart,
  ChevronRight,
  BookOpen,
  Mail,
  Moon,
  Heart,
  Sparkles,
  Snowflake,
  Compass,
  Camera,
  X,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Collection, PalimpsestDocument, CollectionCategory } from '../types';
import { Bookshelf } from './Bookshelf';

interface CollectionsViewProps {
  collections: Collection[];
  documents: PalimpsestDocument[];
  activeCollectionId?: string;
  onSelectCollection: (colId: string) => void;
  onSelectDocument: (docId: string, mode?: 'read' | 'edit') => void;
  onCreateCollection: (newCol: Collection) => void;
  onUpdateCollection?: (col: Collection) => void;
  onDeleteCollection?: (colId: string) => void;
  onNewDocumentInCollection: (category: CollectionCategory) => void;
  onToggleFavorite?: (docId: string, e: React.MouseEvent) => void;
  onDeleteDocument?: (docId: string, e: React.MouseEvent) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  documents,
  activeCollectionId,
  onSelectCollection,
  onSelectDocument,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onNewDocumentInCollection,
  onToggleFavorite,
  onDeleteDocument,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#b45309');

  const selectedCollection = collections.find((c) => c.id === activeCollectionId) || collections[0];
  const collectionDocs = documents.filter((d) => d.category === selectedCollection?.category && !d.isTrash);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    if (editingCollection) {
      const updated: Collection = {
        ...editingCollection,
        name: newColName.trim(),
        description: newColDesc.trim(),
        color: newColColor,
      };
      if (onUpdateCollection) onUpdateCollection(updated);
      setEditingCollection(null);
    } else {
      const newCol: Collection = {
        id: 'col-' + Date.now(),
        name: newColName.trim(),
        category: newColName.trim().toLowerCase().replace(/\s+/g, '-'),
        iconName: 'FolderHeart',
        color: newColColor,
        description: newColDesc.trim() || 'A living collection of stanzas and notes.',
        isCustom: true,
      };
      onCreateCollection(newCol);
    }

    setShowCreateModal(false);
    setNewColName('');
    setNewColDesc('');
  };

  const openEditModal = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(col);
    setNewColName(col.name);
    setNewColDesc(col.description);
    setNewColColor(col.color);
    setShowCreateModal(true);
  };

  const handleDeleteClick = (colId: string, colName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove the collection "${colName}"?`)) {
      if (onDeleteCollection) onDeleteCollection(colId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#fbf8f3] dark:bg-[#181512] font-serif text-[#2c241c] dark:text-[#ebdcc8]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8dfd1] dark:border-[#2d2720] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-sans font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Natasha’s Poetry Collections & Anthologies</span>
          </div>
          <h1 className="text-3xl font-bold font-['Playfair_Display',serif]">
            Bookshelves & Poem Suites
          </h1>
          <p className="text-xs font-serif italic text-[#786b58] dark:text-[#a09280] mt-1">
            "Collections of stanzas, letters, and memory volumes arranged on wooden shelves."
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New 3-4 Poem Suite</span>
        </button>
      </div>

      {/* Bookshelves / Collections Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {collections.map((col) => {
          const isActive = col.id === selectedCollection?.id;
          const count = documents.filter((d) => d.category === col.category && !d.isTrash).length;
          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 group relative ${
                isActive
                  ? 'bg-[#f5ebd9] dark:bg-[#28221c] border-amber-700 shadow-md ring-1 ring-amber-700/30'
                  : 'bg-[#fbf8f3] dark:bg-[#1f1b17] border-[#e8dfd1] dark:border-[#332c24] hover:border-amber-700/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: col.color }}
                >
                  <Layers className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => openEditModal(col, e)}
                    className="p-1 hover:bg-[#efe6d8] dark:hover:bg-[#332a22] rounded text-[#8c7e6b] hover:text-[#2c241c] dark:hover:text-[#ebdcc8]"
                    title="Edit Collection"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {col.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(col.id, col.name, e)}
                      className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded text-rose-600"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="font-bold text-sm text-[#1c1917] dark:text-[#ebdcc8]">
                  {col.name}
                </div>
                <div className="text-[11px] text-[#8c7e6b] font-sans">{count} volumes</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Render Selected Collection as a 3D Bookshelf */}
      {selectedCollection && (
        <section className="space-y-4 pt-2">
          <div className="flex justify-end">
            <button
              onClick={() => onNewDocumentInCollection(selectedCollection.category)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-xl text-xs font-serif font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stanza to {selectedCollection.name}</span>
            </button>
          </div>

          <Bookshelf
            title={selectedCollection.name}
            subtitle={selectedCollection.description}
            documents={collectionDocs}
            onOpenDocument={onSelectDocument}
            onToggleFavorite={onToggleFavorite}
            onDeleteDocument={onDeleteDocument}
            accentColor={selectedCollection.color}
            emptyStateText={`This shelf is waiting for its first story in ${selectedCollection.name}.`}
          />
        </section>
      )}

      {/* Create Custom Collection / Suite Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#3a3229] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-serif text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#f0e5d5] pb-2">
              <h3 className="font-bold text-base text-[#1c1917] dark:text-[#f3e7d3] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>Create 3-4 Poem Suite / Anthology</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-[#efe6d8] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1 font-semibold">
                Anthology / Suite Title
              </label>
              <input
                type="text"
                placeholder="e.g. Four Verses on Autumn for Natasha"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                required
                className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1 font-semibold">
                Dedication & Theme Description
              </label>
              <textarea
                placeholder="e.g. Dedicated to Natasha Raman. Four stanzas written during our autumn trip."
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                rows={2}
                className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1 font-semibold">
                Theme Accent Color
              </label>
              <div className="flex items-center gap-2">
                {['#b45309', '#059669', '#2563eb', '#7c3aed', '#e11d48', '#d97706'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColColor(color)}
                    className={`w-6 h-6 rounded-full border border-black/10 ${
                      newColColor === color ? 'ring-2 ring-amber-800 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded text-xs hover:bg-[#efe6d8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-lg text-xs font-semibold hover:opacity-90"
              >
                Create Anthology Suite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
