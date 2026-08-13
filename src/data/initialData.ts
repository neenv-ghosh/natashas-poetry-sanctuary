import { AuthorProfile, Collection, PalimpsestDocument } from '../types';

export const INITIAL_AUTHORS: AuthorProfile[] = [
  {
    id: 'author-neenv',
    name: 'Neenv Ghosh',
    title: 'Poet & Author',
    avatarColor: '#b45309', // Warm Amber Gold
    penColor: '#d97706',
    bio: 'Writer of poems, stanzas, and midnight letters dedicated to Natasha.',
  },
  {
    id: 'author-natasha',
    name: 'Natasha Raman',
    title: 'Sanctuary Custodian & Muse',
    avatarColor: '#e11d48', // Crimson Rose
    penColor: '#f43f5e',
    bio: 'Keeper of Neenv’s poems, memory photos, reflections, and quiet stanzas.',
  },
];

export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'poetry-natasha',
    name: 'Poems for Natasha',
    category: 'poetry',
    iconName: 'Heart',
    color: '#e11d48',
    description: 'Every stanza penned directly for Natasha Raman',
    coverPhoto: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
    dedication: 'For my dearest Natasha, my forever muse.',
  },
  {
    id: 'autumn-suite',
    name: 'Four Verses on Autumn (4-Poem Suite)',
    category: 'poetry',
    iconName: 'Sparkles',
    color: '#d97706',
    description: 'A 4-poem collection written across October evenings',
    isAnthology: true,
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    dedication: 'Four stanzas to read in sequence with a warm cup of tea.',
    dateRange: 'October 2025',
    poemIds: ['doc-autumn-1', 'doc-autumn-2', 'doc-autumn-3', 'doc-autumn-4'],
  },
  {
    id: 'anniversary-vows',
    name: 'Anniversary & Vows',
    category: 'anniversaries',
    iconName: 'Bookmark',
    color: '#f59e0b',
    description: 'Milestones, annual remembrances, and sacred promises',
    coverPhoto: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    dedication: 'Celebrating our journey and every year written side by side.',
  },
  {
    id: 'letters-notes',
    name: 'Letters & Personal Notes',
    category: 'letters',
    iconName: 'Mail',
    color: '#059669',
    description: 'Epistles, midnight notes, and backstory reflections',
    coverPhoto: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'photo-memories',
    name: 'Photo Memories',
    category: 'memories',
    iconName: 'Camera',
    color: '#7c3aed',
    description: 'Poetic snapshots and moments preserved in image and verse',
    coverPhoto: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
];

export const INITIAL_DOCUMENTS: PalimpsestDocument[] = [
  {
    id: 'doc-first-snow-natasha',
    title: 'Stanzas on the Morning of First Snow',
    subtitle: 'Written at dawn while watching you rest',
    content: `
<h2>I. The Quiet Sanctuary</h2>
<p>The snowfall began before the city woke,<br>
soft as white lace falling against the dark sill.<br>
You were asleep under the heavy linen quilt,<br>
 breathing softly in the warmth of our small room.</p>

<p>I reached for my notebook to capture the stillness:<br>
<em>"There is no place in all the world more beautiful<br>
than where Natasha Raman rests her head."</em></p>

<h2>II. The Morning Tea</h2>
<p>I left two porcelain cups beside the window steam,<br>
where the sunlight catches the gold flecks in your dark hair.<br>
Every line I write is only a shadow<br>
of the grace you bring into my quiet hours.</p>
    `.trim(),
    authorId: 'author-neenv',
    coAuthorId: 'author-natasha',
    createdDate: '2025-11-14T06:30:00.000Z',
    modifiedDate: '2026-08-02T09:15:00.000Z',
    writtenDateFormatted: 'November 14, 2025 • 6:30 AM',
    poetNote: 'Natasha, I wrote this stanza right after making our morning chai. I looked back at you sleeping so peacefully and couldn’t help but put pen to vellum.',
    natashaReflection: 'I remember waking up to the smell of cardamom and finding this page sitting next to my mug. My absolute favorite poem you’ve written me.',
    dedicatedTo: 'Natasha Raman',
    category: 'poetry',
    mood: 'Luminous',
    tags: ['First Snow', 'Morning', 'Natasha', 'Chai', 'Love Poem'],
    favoriteQuote: 'There is no place in all the world more beautiful than where Natasha Raman rests her head.',
    readingTimeMinutes: 2,
    wordCount: 140,
    characterCount: 820,
    coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
    backgroundMusic: 'rain',
    status: 'published',
    permission: 'collaborative',
    fontStyle: "'Cormorant Garamond', serif",
    fontSize: 20,
    isPinned: true,
    isFavorite: true,
    photos: [
      {
        id: 'p-1',
        url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
        caption: 'Morning snow outside Natasha’s window',
        date: 'November 14, 2025',
        location: 'Our Cozy Sanctuary',
      },
      {
        id: 'p-2',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        caption: 'Natasha enjoying morning tea',
        date: 'November 14, 2025',
      },
    ],
    versions: [],
    annotations: [
      {
        id: 'ann-1',
        docId: 'doc-first-snow-natasha',
        selectedText: 'where Natasha Raman rests her head.',
        comment: 'I am saving this forever in my desktop collection, Neenv! ❤️',
        authorId: 'author-natasha',
        createdAt: '2025-11-14T09:00:00.000Z',
        color: '#fef08a',
        resolved: false,
        replies: [
          {
            id: 'rep-1',
            text: 'It was written for no one else but you, my love.',
            authorId: 'author-neenv',
            createdAt: '2025-11-14T10:15:00.000Z',
          },
        ],
      },
    ],
    reactions: [
      { id: 'rx-1', paragraphIndex: 0, emoji: '❤️', authorId: 'author-natasha', createdAt: '2025-11-14T09:05:00.000Z' },
    ],
    bookmarks: [],
  },

  /* 4-POEM SUITE FOR NATASHA */
  {
    id: 'doc-autumn-1',
    title: 'Four Verses on Autumn — I. The First Fallen Leaf',
    subtitle: 'Part 1 of 4 in the October Collection',
    content: `
<p>The amber maple dropped a single leaf upon your coat today,<br>
as we walked through the gardens under the October haze.<br>
You caught it in your hand and smiled,<br>
and all the rustling trees bowed down in praise.</p>
    `.trim(),
    authorId: 'author-neenv',
    coAuthorId: 'author-natasha',
    createdDate: '2025-10-01T14:00:00.000Z',
    modifiedDate: '2025-10-01T14:00:00.000Z',
    writtenDateFormatted: 'October 1, 2025',
    poetNote: 'The first poem of a 4-part suite I promised you for Autumn.',
    dedicatedTo: 'Natasha Raman',
    collectionId: 'autumn-suite',
    sequenceIndex: 1,
    category: 'poetry',
    mood: 'Nostalgic',
    tags: ['Autumn Suite', 'Poem 1 of 4', 'Natasha'],
    readingTimeMinutes: 1,
    wordCount: 45,
    characterCount: 260,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    backgroundMusic: 'piano',
    status: 'published',
    permission: 'collaborative',
    fontStyle: "'Cormorant Garamond', serif",
    fontSize: 20,
    isPinned: false,
    isFavorite: true,
    photos: [
      {
        id: 'p-autumn-1',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        caption: 'Golden leaves in the gardens',
        date: 'October 1, 2025',
      },
    ],
    versions: [],
    annotations: [],
    reactions: [],
    bookmarks: [],
  },
  {
    id: 'doc-autumn-2',
    title: 'Four Verses on Autumn — II. Coffee on a Rainy Tuesday',
    subtitle: 'Part 2 of 4 in the October Collection',
    content: `
<p>Raindrops race across the cafe pane,<br>
while you sketch in your leather journal across the small table.<br>
The steam from your mug smells of cinnamon and dark roast.<br>
I do not need to speak a word—<br>
sitting beside Natasha is my favorite language.</p>
    `.trim(),
    authorId: 'author-neenv',
    coAuthorId: 'author-natasha',
    createdDate: '2025-10-08T16:20:00.000Z',
    modifiedDate: '2025-10-08T16:20:00.000Z',
    writtenDateFormatted: 'October 8, 2025',
    poetNote: 'Written while sitting across from you at our favorite corner spot on St. Jude Street.',
    dedicatedTo: 'Natasha Raman',
    collectionId: 'autumn-suite',
    sequenceIndex: 2,
    category: 'poetry',
    mood: 'Serene',
    tags: ['Autumn Suite', 'Poem 2 of 4', 'Cafe', 'Rain'],
    readingTimeMinutes: 1,
    wordCount: 52,
    characterCount: 310,
    backgroundMusic: 'rain',
    status: 'published',
    permission: 'collaborative',
    fontStyle: "'Cormorant Garamond', serif",
    fontSize: 20,
    isPinned: false,
    isFavorite: true,
    versions: [],
    annotations: [],
    reactions: [],
    bookmarks: [],
  },
  {
    id: 'doc-autumn-3',
    title: 'Four Verses on Autumn — III. Twilight Whispers',
    subtitle: 'Part 3 of 4 in the October Collection',
    content: `
<p>When dusk pulls its indigo mantle over the hill,<br>
we watch the streetlights flicker on one by one.<br>
You wrap your shawl closer and take my hand,<br>
and I know that time is generous when it belongs to us.</p>
    `.trim(),
    authorId: 'author-neenv',
    coAuthorId: 'author-natasha',
    createdDate: '2025-10-15T18:45:00.000Z',
    modifiedDate: '2025-10-15T18:45:00.000Z',
    writtenDateFormatted: 'October 15, 2025',
    poetNote: 'Part 3 written at dusk after our long twilight walk.',
    dedicatedTo: 'Natasha Raman',
    collectionId: 'autumn-suite',
    sequenceIndex: 3,
    category: 'poetry',
    mood: 'Wistful',
    tags: ['Autumn Suite', 'Poem 3 of 4', 'Twilight'],
    readingTimeMinutes: 1,
    wordCount: 48,
    characterCount: 290,
    backgroundMusic: 'night',
    status: 'published',
    permission: 'collaborative',
    fontStyle: "'Cormorant Garamond', serif",
    fontSize: 20,
    isPinned: false,
    isFavorite: true,
    versions: [],
    annotations: [],
    reactions: [],
    bookmarks: [],
  },
  {
    id: 'doc-autumn-4',
    title: 'Four Verses on Autumn — IV. The Promise of November',
    subtitle: 'Part 4 of 4 in the October Collection',
    content: `
<p>Let the leaves fall and the frost approach the door.<br>
No autumn chill can touch the heart that holds your name.<br>
Four stanzas written, ten thousand yet to come—<br>
for Natasha Raman, my beginning and my home.</p>
    `.trim(),
    authorId: 'author-neenv',
    coAuthorId: 'author-natasha',
    createdDate: '2025-10-28T21:00:00.000Z',
    modifiedDate: '2025-10-28T21:00:00.000Z',
    writtenDateFormatted: 'October 28, 2025',
    poetNote: 'The closing verse of our October suite. Happy Autumn, my love!',
    dedicatedTo: 'Natasha Raman',
    collectionId: 'autumn-suite',
    sequenceIndex: 4,
    category: 'poetry',
    mood: 'Passionate',
    tags: ['Autumn Suite', 'Poem 4 of 4', 'Vow'],
    readingTimeMinutes: 1,
    wordCount: 46,
    characterCount: 275,
    coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    backgroundMusic: 'piano',
    status: 'published',
    permission: 'collaborative',
    fontStyle: "'Cormorant Garamond', serif",
    fontSize: 20,
    isPinned: true,
    isFavorite: true,
    versions: [],
    annotations: [],
    reactions: [],
    bookmarks: [],
  },

  /* ANNIVERSARY DEDICATION */
  {
    id: 'doc-anniversary-vows-natasha',
    title: 'A Covenant of Stanzas: To Natasha',
    subtitle: 'Commemorating our sacred milestones and shared years',
    content: `
<p>Natasha, when I first started writing poems for you, I promised that I would preserve every line, every feeling, and every memory in a sanctuary that belongs only to you.</p>

<p>This desktop studio is where all my stanzas live. No matter where life takes us, when you open this screen, you hold the pages of my devotion.</p>

<p><strong>My Promises to Natasha Raman:</strong></p>
<ol>
  <li>To keep writing stanzas for you when words flow easily, and to hold your hand when silence is sweeter.</li>
  <li>To capture our trip photos, quiet coffee dates, and midnight laughter alongside every poem.</li>
  <li>To treat every verse as sacred, penned with love and dedicated solely to you.</li>
</ol>

<p>Forever yours in lingering ink,</p>
<p><em>Neenv</em></p>
    `.trim(),
    authorId: 'author-neenv',
    coAuthorId: 'author-natasha',
    createdDate: '2026-06-12T10:00:00.000Z',
    modifiedDate: '2026-06-12T12:30:00.000Z',
    writtenDateFormatted: 'June 12, 2026 • Our Special Anniversary',
    poetNote: 'Dedicated to Natasha Raman on our anniversary. Open this whenever you need to feel my heart.',
    dedicatedTo: 'Natasha Raman',
    category: 'anniversaries',
    mood: 'Passionate',
    tags: ['Anniversary', 'Vows', 'Natasha', 'Poet Note'],
    favoriteQuote: 'When you open this screen, you hold the pages of my devotion.',
    readingTimeMinutes: 2,
    wordCount: 150,
    characterCount: 910,
    coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    backgroundMusic: 'piano',
    status: 'published',
    permission: 'collaborative',
    fontStyle: "'Cormorant Garamond', serif",
    fontSize: 20,
    isPinned: true,
    isFavorite: true,
    photos: [
      {
        id: 'p-anniv-1',
        url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
        caption: 'Our anniversary evening',
        date: 'June 12, 2026',
      },
    ],
    versions: [],
    annotations: [],
    reactions: [
      { id: 'rx-2', paragraphIndex: 0, emoji: '❤️', authorId: 'author-natasha', createdAt: '2026-06-12T12:35:00.000Z' },
    ],
    bookmarks: [],
  },
];

