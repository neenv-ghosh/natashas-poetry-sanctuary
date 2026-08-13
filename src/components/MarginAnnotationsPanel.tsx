import React, { useState } from 'react';
import {
  MessageSquare,
  History,
  Info,
  Bookmark as BookmarkIcon,
  CheckCircle2,
  Send,
  RotateCcw,
  Tag,
  Music,
  Image as ImageIcon,
  Heart,
  User,
  Calendar,
  Smile,
  X,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Annotation,
  AuthorProfile,
  Bookmark,
  Collection,
  DocumentVersion,
  PalimpsestDocument,
  ParagraphReaction,
} from '../types';

interface MarginAnnotationsPanelProps {
  document: PalimpsestDocument;
  authors: AuthorProfile[];
  currentAuthorId: string;
  collections: Collection[];
  onUpdateDocument: (updated: PalimpsestDocument) => void;
  onRestoreVersion: (versionNum: number) => void;
  onSelectTextForAnnotation?: (selectedText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MarginAnnotationsPanel: React.FC<MarginAnnotationsPanelProps> = ({
  document,
  authors,
  currentAuthorId,
  collections,
  onUpdateDocument,
  onRestoreVersion,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'annotations' | 'history' | 'info' | 'bookmarks'>('annotations');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [newAnnotationComment, setNewAnnotationComment] = useState('');
  const [selectedTextSnippet, setSelectedTextSnippet] = useState('');
  const [editingMetadata, setEditingMetadata] = useState(false);

  const currentAuthor = authors.find((a) => a.id === currentAuthorId) || authors[0];

  const handleAddReply = (annotationId: string) => {
    const text = replyText[annotationId];
    if (!text || !text.trim()) return;

    const updatedAnnotations = document.annotations.map((ann) => {
      if (ann.id === annotationId) {
        return {
          ...ann,
          replies: [
            ...ann.replies,
            {
              id: 'rep-' + Date.now(),
              text: text.trim(),
              authorId: currentAuthorId,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return ann;
    });

    onUpdateDocument({
      ...document,
      annotations: updatedAnnotations,
    });

    setReplyText({ ...replyText, [annotationId]: '' });
  };

  const handleToggleResolveAnnotation = (annotationId: string) => {
    const updatedAnnotations = document.annotations.map((ann) =>
      ann.id === annotationId ? { ...ann, resolved: !ann.resolved } : ann
    );
    onUpdateDocument({ ...document, annotations: updatedAnnotations });
  };

  const handleCreateNewAnnotation = () => {
    if (!newAnnotationComment.trim()) return;

    const newAnn: Annotation = {
      id: 'ann-' + Date.now(),
      docId: document.id,
      selectedText: selectedTextSnippet || 'Margin Note',
      comment: newAnnotationComment.trim(),
      authorId: currentAuthorId,
      createdAt: new Date().toISOString(),
      color: '#fef08a',
      resolved: false,
      replies: [],
    };

    onUpdateDocument({
      ...document,
      annotations: [newAnn, ...document.annotations],
    });

    setNewAnnotationComment('');
    setSelectedTextSnippet('');
  };

  const handleAddBookmark = (textSnippet: string, note: string) => {
    const newBm: Bookmark = {
      id: 'bm-' + Date.now(),
      docId: document.id,
      textSnippet,
      note,
      authorId: currentAuthorId,
      createdAt: new Date().toISOString(),
    };
    onUpdateDocument({
      ...document,
      bookmarks: [newBm, ...(document.bookmarks || [])],
    });
  };

  const handleDeleteBookmark = (bmId: string) => {
    onUpdateDocument({
      ...document,
      bookmarks: document.bookmarks.filter((b) => b.id !== bmId),
    });
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 right-0 z-40 w-80 bg-[#f8f4ed] dark:bg-[#1a1714] border-l border-[#e8dfd1] dark:border-[#2d2720] flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}
    >
      {/* Header Tabs */}
      <div className="flex items-center justify-between p-2 border-b border-[#e8dfd1] dark:border-[#2d2720] bg-[#f2ebd9] dark:bg-[#231e19]">
        <div className="flex items-center gap-1 font-serif text-xs">
          <button
            onClick={() => setActiveTab('annotations')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'annotations'
                ? 'bg-[#f8f4ed] dark:bg-[#1a1714] text-[#2c241c] dark:text-[#ebdcc8] font-bold shadow-2xs'
                : 'text-[#786b58] dark:text-[#9e907e] hover:text-[#2c241c]'
            }`}
            title="Margin Annotations & Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Margin</span>
            {document.annotations.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-800 text-amber-100 font-sans">
                {document.annotations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-[#f8f4ed] dark:bg-[#1a1714] text-[#2c241c] dark:text-[#ebdcc8] font-bold shadow-2xs'
                : 'text-[#786b58] dark:text-[#9e907e] hover:text-[#2c241c]'
            }`}
            title="Layer History & Versions"
          >
            <History className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-[#f8f4ed] dark:bg-[#1a1714] text-[#2c241c] dark:text-[#ebdcc8] font-bold shadow-2xs'
                : 'text-[#786b58] dark:text-[#9e907e] hover:text-[#2c241c]'
            }`}
            title="Bookmarks"
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
              activeTab === 'info'
                ? 'bg-[#f8f4ed] dark:bg-[#1a1714] text-[#2c241c] dark:text-[#ebdcc8] font-bold shadow-2xs'
                : 'text-[#786b58] dark:text-[#9e907e] hover:text-[#2c241c]'
            }`}
            title="Document Info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="md:hidden p-1 rounded hover:bg-[#e8dfd1] dark:hover:bg-[#2d2720]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 text-xs font-serif space-y-4">
        {/* TAB 1: MARGIN ANNOTATIONS */}
        {activeTab === 'annotations' && (
          <div className="space-y-3">
            {/* New Annotation Form */}
            <div className="p-3 bg-[#f2ebd9] dark:bg-[#231e19] border border-[#e5dad0] dark:border-[#383028] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#524636] dark:text-[#c4b59f]">
                <span className="flex items-center gap-1 font-sans uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  Add Margin Note
                </span>
                <span className="text-[10px] text-[#8c7e6b]">As {currentAuthor.name}</span>
              </div>

              <textarea
                value={newAnnotationComment}
                onChange={(e) => setNewAnnotationComment(e.target.value)}
                placeholder="Write a comment, memory, or reflection on this stanza..."
                rows={3}
                className="w-full min-h-[75px] p-2 bg-[#fbf8f3] dark:bg-[#1c1916] border border-[#dfd5c5] dark:border-[#332b23] rounded-lg text-xs font-serif text-[#2c241c] dark:text-[#e0d6c5] focus:outline-none focus:ring-1 focus:ring-amber-700 resize-y"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleCreateNewAnnotation}
                  disabled={!newAnnotationComment.trim()}
                  className="px-3 py-1 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Annotate</span>
                </button>
              </div>
            </div>

            {/* Existing Annotations Thread List */}
            {document.annotations.length === 0 ? (
              <div className="text-center py-8 text-[#8c7e6b] dark:text-[#786b59]">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No margin notes yet.</p>
                <p className="text-[11px] mt-1 italic">
                  Select text in the document or write a comment above to start a thread.
                </p>
              </div>
            ) : (
              document.annotations.map((ann) => {
                const annAuthor = authors.find((a) => a.id === ann.authorId) || currentAuthor;
                return (
                  <div
                    key={ann.id}
                    className={`p-3 rounded-xl border transition-all ${
                      ann.resolved
                        ? 'bg-[#f3ede1]/50 dark:bg-[#201c18]/50 border-[#e0d5c3] dark:border-[#2e2821] opacity-60'
                        : 'bg-[#fbf8f3] dark:bg-[#201c18] border-[#ebd2b4] dark:border-[#3a3229] shadow-2xs'
                    }`}
                  >
                    {/* Quoted Text */}
                    {ann.selectedText && (
                      <div className="pl-2.5 border-l-2 border-amber-600 dark:border-amber-500 italic text-[11px] text-[#615343] dark:text-[#b0a290] mb-2 bg-amber-500/5 py-1 pr-1 rounded-r">
                        "{ann.selectedText}"
                      </div>
                    )}

                    {/* Annotation Author & Time */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ backgroundColor: annAuthor.avatarColor }}
                        >
                          {annAuthor.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-xs text-[#2c241c] dark:text-[#ebdcc8]">
                          {annAuthor.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8c7e6b] font-sans">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Comment Body */}
                    <p className="text-xs text-[#383027] dark:text-[#d6c7b2] leading-relaxed mb-2">
                      {ann.comment}
                    </p>

                    {/* Replies */}
                    {ann.replies && ann.replies.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#f0e5d5] dark:border-[#2e2821] space-y-2 pl-2">
                        {ann.replies.map((rep) => {
                          const repAuthor = authors.find((a) => a.id === rep.authorId) || currentAuthor;
                          return (
                            <div key={rep.id} className="text-[11px] space-y-0.5">
                              <div className="flex items-center justify-between text-[#786b58]">
                                <span className="font-semibold">{repAuthor.name}</span>
                                <span className="text-[9px] font-sans">
                                  {new Date(rep.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-[#3d3328] dark:text-[#c7baa8]">{rep.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reply Input & Resolve Action */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Reply..."
                        value={replyText[ann.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [ann.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddReply(ann.id);
                        }}
                        className="flex-1 px-2 py-1 bg-[#f0e8db] dark:bg-[#181512] border border-[#dfd5c5] dark:border-[#332b23] rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                      <button
                        onClick={() => handleAddReply(ann.id)}
                        className="p-1 text-amber-800 dark:text-amber-400 hover:opacity-80"
                        title="Send Reply"
                      >
                        <Send className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleToggleResolveAnnotation(ann.id)}
                        className={`p-1 rounded transition-colors ${
                          ann.resolved ? 'text-green-600' : 'text-[#8c7e6b] hover:text-green-700'
                        }`}
                        title={ann.resolved ? 'Reopen annotation' : 'Mark as resolved'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: LAYER HISTORY (VERSIONS) */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-[#f2ebd9] dark:bg-[#231e19] border border-[#e5dad0] dark:border-[#383028] rounded-xl text-xs text-[#615343] dark:text-[#a89a87] leading-normal">
              Every draft, stanza revision, and co-author addition is preserved forever. Nothing is ever overwritten.
            </div>

            {(!document.versions || document.versions.length === 0) ? (
              <div className="text-center py-8 text-[#8c7e6b]">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Version 1 (Initial Layer)</p>
                <p className="text-[11px] mt-1 italic">
                  Edits will automatically record new manuscript layers here.
                </p>
              </div>
            ) : (
              document.versions.map((ver) => {
                const verAuthor = authors.find((a) => a.id === ver.authorId) || currentAuthor;
                return (
                  <div
                    key={ver.versionNumber}
                    className="p-3 bg-[#fbf8f3] dark:bg-[#201c18] border border-[#ebd2b4] dark:border-[#3a3229] rounded-xl space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-900 dark:text-amber-300">
                          Layer #{ver.versionNumber}
                        </span>
                        <span className="text-[10px] text-[#8c7e6b] font-sans">
                          {new Date(ver.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                        style={{ backgroundColor: verAuthor.avatarColor }}
                        title={`Author: ${verAuthor.name}`}
                      >
                        {verAuthor.name.charAt(0)}
                      </div>
                    </div>

                    <p className="text-xs text-[#3d3328] dark:text-[#c7baa8] italic">
                      "{ver.changeSummary}"
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onRestoreVersion(ver.versionNumber)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#efe6d8] dark:bg-[#2b251e] border border-[#ded5c6] dark:border-[#3d3429] hover:bg-[#e2d7c5] rounded text-[11px] font-medium text-[#2c241c] dark:text-[#ebdcc8] transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                        <span>Restore Layer</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: BOOKMARKS */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[#786b58] italic">
              Bookmarked favorite stanzas and passages across this piece.
            </div>

            {(!document.bookmarks || document.bookmarks.length === 0) ? (
              <div className="text-center py-8 text-[#8c7e6b]">
                <BookmarkIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No bookmarks saved yet.</p>
              </div>
            ) : (
              document.bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 bg-[#fbf8f3] dark:bg-[#201c18] border border-[#ebd2b4] dark:border-[#3a3229] rounded-xl space-y-1.5 relative group"
                >
                  <button
                    onClick={() => handleDeleteBookmark(bm.id)}
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                    title="Delete Bookmark"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="pl-2 border-l-2 border-amber-600 italic text-xs text-[#2c241c] dark:text-[#ebdcc8]">
                    "{bm.textSnippet}"
                  </div>
                  {bm.note && (
                    <p className="text-[11px] text-[#615343] dark:text-[#a89a87] font-sans">
                      Note: {bm.note}
                    </p>
                  )}
                  <div className="text-[10px] text-[#8c7e6b] font-sans pt-1">
                    Saved on {new Date(bm.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: DOCUMENT INFO & METADATA */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#fbf8f3] dark:bg-[#201c18] border border-[#ebd2b4] dark:border-[#3a3229] rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#ebd2b4]/40 pb-2">
                <span className="font-bold text-sm font-['Playfair_Display',serif]">
                  Manuscript Properties
                </span>
                <button
                  onClick={() => setEditingMetadata(!editingMetadata)}
                  className="text-xs text-amber-800 dark:text-amber-400 font-sans hover:underline"
                >
                  {editingMetadata ? 'Done' : 'Edit'}
                </button>
              </div>

              {/* Status & Permission */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-sans tracking-wider text-[#8c7e6b]">
                    Status
                  </label>
                  {editingMetadata ? (
                    <select
                      value={document.status}
                      onChange={(e) =>
                        onUpdateDocument({
                          ...document,
                          status: e.target.value as PalimpsestDocument['status'],
                        })
                      }
                      className="w-full mt-1 p-1 bg-[#efe6d8] dark:bg-[#28221c] rounded border border-[#dfd5c5] text-xs font-serif"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  ) : (
                    <div className="capitalize font-medium text-amber-900 dark:text-amber-300">
                      {document.status}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase font-sans tracking-wider text-[#8c7e6b]">
                    Sharing
                  </label>
                  {editingMetadata ? (
                    <select
                      value={document.permission}
                      onChange={(e) =>
                        onUpdateDocument({
                          ...document,
                          permission: e.target.value as PalimpsestDocument['permission'],
                        })
                      }
                      className="w-full mt-1 p-1 bg-[#efe6d8] dark:bg-[#28221c] rounded border border-[#dfd5c5] text-xs font-serif"
                    >
                      <option value="collaborative">Collaborative</option>
                      <option value="shared">Shared</option>
                      <option value="readonly">Read Only</option>
                      <option value="private">Private</option>
                    </select>
                  ) : (
                    <div className="capitalize font-medium">{document.permission}</div>
                  )}
                </div>
              </div>

              {/* Mood & Category */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-sans tracking-wider text-[#8c7e6b]">
                    Mood
                  </label>
                  {editingMetadata ? (
                    <input
                      type="text"
                      value={document.mood || ''}
                      onChange={(e) => onUpdateDocument({ ...document, mood: e.target.value })}
                      className="w-full mt-1 p-1 bg-[#efe6d8] dark:bg-[#28221c] rounded border border-[#dfd5c5] text-xs font-serif"
                    />
                  ) : (
                    <div className="font-serif italic text-amber-900 dark:text-amber-300">
                      "{document.mood}"
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase font-sans tracking-wider text-[#8c7e6b]">
                    Collection
                  </label>
                  {editingMetadata ? (
                    <select
                      value={document.category}
                      onChange={(e) =>
                        onUpdateDocument({
                          ...document,
                          category: e.target.value as PalimpsestDocument['category'],
                        })
                      }
                      className="w-full mt-1 p-1 bg-[#efe6d8] dark:bg-[#28221c] rounded border border-[#dfd5c5] text-xs font-serif"
                    >
                      {collections.map((c) => (
                        <option key={c.id} value={c.category}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="capitalize font-medium">
                      {collections.find((c) => c.category === document.category)?.name ||
                        document.category}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase font-sans tracking-wider text-[#8c7e6b]">
                    Favorite Quote
                  </label>
                  {editingMetadata ? (
                    <textarea
                      value={document.favoriteQuote || ''}
                      onChange={(e) =>
                        onUpdateDocument({ ...document, favoriteQuote: e.target.value })
                      }
                      rows={2}
                      className="w-full mt-1 p-1 bg-[#efe6d8] dark:bg-[#28221c] rounded border border-[#dfd5c5] text-xs font-serif resize-none"
                    />
                  ) : (
                    <div className="italic text-[#524636] dark:text-[#a89a87] pl-2 border-l border-amber-600">
                      "{document.favoriteQuote || 'None set'}"
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Metrics */}
              <div className="pt-2 border-t border-[#ebd2b4]/40 grid grid-cols-3 gap-2 text-center text-xs font-sans">
                <div className="p-2 bg-[#f0e8db] dark:bg-[#25201a] rounded-lg">
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    {document.wordCount}
                  </div>
                  <div className="text-[9px] text-[#8c7e6b]">Words</div>
                </div>
                <div className="p-2 bg-[#f0e8db] dark:bg-[#25201a] rounded-lg">
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    {document.readingTimeMinutes} min
                  </div>
                  <div className="text-[9px] text-[#8c7e6b]">Read Time</div>
                </div>
                <div className="p-2 bg-[#f0e8db] dark:bg-[#25201a] rounded-lg">
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    {document.versions?.length || 1}
                  </div>
                  <div className="text-[9px] text-[#8c7e6b]">Layers</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
