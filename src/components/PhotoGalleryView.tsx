import React, { useState } from 'react';
import { Camera, Plus, Calendar, MapPin, Heart, BookOpen, Trash2, X } from 'lucide-react';
import { PalimpsestDocument, PhotoMemory } from '../types';

interface PhotoGalleryViewProps {
  documents: PalimpsestDocument[];
  onSelectDocument: (docId: string) => void;
  onUpdateDocument: (doc: PalimpsestDocument) => void;
}

export const PhotoGalleryView: React.FC<PhotoGalleryViewProps> = ({
  documents,
  onSelectDocument,
  onUpdateDocument,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDate, setPhotoDate] = useState('');
  const [photoLocation, setPhotoLocation] = useState('');

  // Collect all photos attached to documents
  const allPhotoItems = documents.flatMap((doc) =>
    (doc.photos || []).map((photo) => ({
      photo,
      doc,
    }))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim() || !selectedDocId) return;

    const targetDoc = documents.find((d) => d.id === selectedDocId);
    if (!targetDoc) return;

    const newPhoto: PhotoMemory = {
      id: 'photo-' + Date.now(),
      url: photoUrl.trim(),
      caption: photoCaption.trim() || 'A cherished moment for Natasha',
      date: photoDate.trim() || new Date().toLocaleDateString(),
      location: photoLocation.trim() || undefined,
    };

    const updatedDoc = {
      ...targetDoc,
      photos: [newPhoto, ...(targetDoc.photos || [])],
    };

    onUpdateDocument(updatedDoc);
    setShowAddModal(false);
    setPhotoUrl('');
    setPhotoCaption('');
    setPhotoDate('');
    setPhotoLocation('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#fbf8f3] dark:bg-[#181512] font-serif text-[#2c241c] dark:text-[#ebdcc8]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8dfd1] dark:border-[#2d2720] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-sans font-semibold mb-1">
            <Camera className="w-4 h-4" />
            <span>Natasha’s Memory Gallery</span>
          </div>
          <h1 className="text-3xl font-bold font-['Playfair_Display',serif]">
            Photos & Keepsakes
          </h1>
          <p className="text-xs font-serif italic text-[#786b58] dark:text-[#a09280] mt-1">
            "Every snapshot preserved alongside Neenv’s poems and stanzas."
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo Memory</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {allPhotoItems.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[#f6f2ea] dark:bg-[#1d1915] border border-[#e8dfd1] dark:border-[#332c24] rounded-2xl p-8">
          <Camera className="w-10 h-10 text-amber-800/40 mx-auto" />
          <h3 className="text-lg font-bold">No photo memories added yet</h3>
          <p className="text-xs italic text-[#786b58] max-w-sm mx-auto">
            You can attach photos to any poem written for Natasha, or upload them here to pair with a stanza!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-800 text-amber-100 rounded-lg text-xs font-sans font-medium"
          >
            Attach First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allPhotoItems.map(({ photo, doc }) => (
            <div
              key={photo.id}
              className="bg-[#ffffff] dark:bg-[#201c18] border border-[#e8dfd1] dark:border-[#383028] rounded-xl p-3 shadow-md hover:shadow-xl transition-all group relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="overflow-hidden rounded-lg bg-[#f0e8db] dark:bg-[#181512] aspect-4/3 relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Natasha memory'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-sans flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                    <span>Memory</span>
                  </div>
                </div>

                {photo.caption && (
                  <p className="font-serif italic text-xs text-[#2c241c] dark:text-[#ebdcc8] font-medium leading-snug">
                    "{photo.caption}"
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-sans text-[#786b58] dark:text-[#a09280] pt-1">
                  {photo.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-800" />
                      <span>{photo.date}</span>
                    </span>
                  )}
                  {photo.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-800" />
                      <span>{photo.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Poem Association Link */}
              <div
                onClick={() => onSelectDocument(doc.id)}
                className="mt-3 pt-2 border-t border-[#f0e5d5] dark:border-[#2b251e] flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300 font-serif cursor-pointer hover:underline"
              >
                <span className="truncate font-semibold flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="truncate">{doc.title}</span>
                </span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Photo Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddPhotoSubmit}
            className="bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#3a3229] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-serif text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#f0e5d5] pb-2">
              <h3 className="font-bold text-base text-[#1c1917] dark:text-[#f3e7d3] flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-800" />
                <span>Attach Photo Memory for Natasha</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[#efe6d8] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Select */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1 font-semibold">
                Attach to Poem / Letter:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({doc.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Upload or URL */}
            <div className="space-y-2">
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] font-semibold">
                Photo Source:
              </label>

              <div className="flex items-center gap-2">
                <label className="flex-1 px-3 py-2 bg-[#e8dfd1] dark:bg-[#28221c] border border-dashed border-amber-800/40 rounded-lg text-center cursor-pointer hover:bg-[#e0d6c5] transition-colors">
                  <span className="text-xs text-[#2c241c] dark:text-[#ebdcc8] font-sans font-medium">
                    Upload Local Photo File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center text-[10px] text-[#8c7e6b] font-sans">or paste image URL:</div>

              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none"
              />
            </div>

            {photoUrl && (
              <div className="h-32 rounded-lg overflow-hidden border border-[#dfd5c5] bg-[#181512]">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Photo details */}
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1">
                  Caption / Note:
                </label>
                <input
                  type="text"
                  placeholder="Our rainy afternoon walk in autumn..."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1">
                    Date:
                  </label>
                  <input
                    type="text"
                    placeholder="October 14, 2025"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1">
                    Location:
                  </label>
                  <input
                    type="text"
                    placeholder="Garden Pavilion"
                    value={photoLocation}
                    onChange={(e) => setPhotoLocation(e.target.value)}
                    className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded text-xs hover:bg-[#efe6d8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!photoUrl.trim()}
                className="px-4 py-1.5 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-40"
              >
                Save Photo Memory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
