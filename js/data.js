/* ============================================================
   STUDYFLOW  |  js/data.js
   NCERT Grade 9 Seed Data — All 7 Subjects + Official Chapters
   ============================================================ */
'use strict';

const SEED = {
    subjects: [
        { id: 1, name: 'English',              subtitle: 'Kaveri',                     icon: '📘', color: '#4A9EFF', order: 1 },
        { id: 2, name: 'Hindi',                subtitle: 'Ganga (गंगा)',               icon: '🪷', color: '#FF6B6B', order: 2 },
        { id: 3, name: 'Marathi',              subtitle: 'Aksharbharti (अक्षरभारती)', icon: '📖', color: '#A78BFA', order: 3 },
        { id: 4, name: 'Science',              subtitle: 'Exploration',                icon: '🔬', color: '#00D4AA', order: 4 },
        { id: 5, name: 'Mathematics',          subtitle: 'Ganita Manjari',             icon: '📐', color: '#7C6FFF', order: 5 },
        { id: 6, name: 'Social Science',       subtitle: 'Understanding Society',      icon: '🌍', color: '#FFA502', order: 6 },
        { id: 7, name: 'Information Technology', subtitle: 'Code 402',                icon: '💻', color: '#06B6D4', order: 7 },
    ],

    chapters: [
        /* ─── English — Kaveri (subjectId: 1) ─── */
        { subjectId: 1, name: 'Prose 1 — How I Taught My Grandmother to Read', order:  1, isCustom: false },
        { subjectId: 1, name: 'Prose 2 — The Pot Maker',                       order:  2, isCustom: false },
        { subjectId: 1, name: 'Prose 3 — Winds of Change',                     order:  3, isCustom: false },
        { subjectId: 1, name: 'Prose 4 — Vitamin-M',                           order:  4, isCustom: false },
        { subjectId: 1, name: 'Prose 5 — The World of Limitless Possibilities',order:  5, isCustom: false },
        { subjectId: 1, name: 'Prose 6 — Twin Melodies',                       order:  6, isCustom: false },
        { subjectId: 1, name: 'Prose 7 — Carrier of Words',                    order:  7, isCustom: false },
        { subjectId: 1, name: 'Prose 8 — Follow That Dream',                   order:  8, isCustom: false },
        { subjectId: 1, name: 'Poetry 1 — Bharat Our Land',                    order:  9, isCustom: false },
        { subjectId: 1, name: 'Poetry 2 — Gifts of Grace: Honouring Our Vocations', order: 10, isCustom: false },
        { subjectId: 1, name: 'Poetry 3 — Canvas of Soil',                     order: 11, isCustom: false },
        { subjectId: 1, name: 'Poetry 4 — I Cannot Remember My Mother',        order: 12, isCustom: false },
        { subjectId: 1, name: 'Poetry 5 — Nine Gold Medals',                   order: 13, isCustom: false },
        { subjectId: 1, name: 'Poetry 6 — A Friend Found in Music',            order: 14, isCustom: false },
        { subjectId: 1, name: 'Poetry 7 — Words',                              order: 15, isCustom: false },
        { subjectId: 1, name: 'Poetry 8 — Believe in Yourself',                order: 16, isCustom: false },

        /* ─── Hindi — Ganga (subjectId: 2) ─── */
        { subjectId: 2, name: 'Chapter 1 — दो बैलों की कथा',                  order:  1, isCustom: false },
        { subjectId: 2, name: 'Chapter 2 — राम-लक्ष्मण-परशुराम संवाद',        order:  2, isCustom: false },
        { subjectId: 2, name: 'Chapter 3 — रीढ़ की हड्डी (एकांकी)',            order:  3, isCustom: false },
        { subjectId: 2, name: 'Chapter 4 — घर की याद',                         order:  4, isCustom: false },
        { subjectId: 2, name: 'Chapter 5 — झाँसी की रानी',                     order:  5, isCustom: false },
        { subjectId: 2, name: 'Chapter 6 — भारति, जय, विजयकरे',               order:  6, isCustom: false },
        { subjectId: 2, name: 'Chapter 7 — रैदास के पद',                       order:  7, isCustom: false },
        { subjectId: 2, name: 'Chapter 8 — मैं और मेरा देश',                   order:  8, isCustom: false },
        { subjectId: 2, name: 'Chapter 9 — आखिरी चट्टान तक',                  order:  9, isCustom: false },
        { subjectId: 2, name: 'Chapter 10 — ऐसी भी बातें होती हैं',            order: 10, isCustom: false },
        { subjectId: 2, name: 'Chapter 11 — संवादहीन',                         order: 11, isCustom: false },
        { subjectId: 2, name: 'Chapter 12 — क्या लिखूँ',                       order: 12, isCustom: false },

        /* ─── Marathi — Aksharbharti (subjectId: 3) ─── */
        { subjectId: 3, name: '१. सर्वात्मका शिवसुंदरा (प्रार्थना)',           order:  1, isCustom: false },
        { subjectId: 3, name: '२. संतवाणी — भेटीलागी जीवा / संतकृपा झाली',   order:  2, isCustom: false },
        { subjectId: 3, name: '३. बेटा, मी ऐकतो आहे!',                        order:  3, isCustom: false },
        { subjectId: 3, name: '४. जी. आय. पी. रेल्वे',                        order:  4, isCustom: false },
        { subjectId: 3, name: '(स्थूलवाचन) काझीरंगा',                         order:  5, isCustom: false },
        { subjectId: 3, name: '५. व्यायामाचे महत्त्व (कविता)',                 order:  6, isCustom: false },
        { subjectId: 3, name: '६. ऑलिंपिक वर्तुळांचा गोफ',                   order:  7, isCustom: false },
        { subjectId: 3, name: '७. दिव्याच्या शोधामागचे दिव्य',                order:  8, isCustom: false },
        { subjectId: 3, name: '८. सखू आजी',                                    order:  9, isCustom: false },
        { subjectId: 3, name: '(स्थूलवाचन) हास्यचित्रांतली मुलं',             order: 10, isCustom: false },
        { subjectId: 3, name: '९. उजाड उघडे माळरानही (कविता)',                 order: 11, isCustom: false },
        { subjectId: 3, name: '१०. कुलूप',                                     order: 12, isCustom: false },
        { subjectId: 3, name: '११. आभाळातल्या पाऊलवाटा',                       order: 13, isCustom: false },
        { subjectId: 3, name: '१२. पुन्हा एकदा (कविता)',                       order: 14, isCustom: false },

        /* ─── Science — Exploration (subjectId: 4) ─── */
        { subjectId: 4, name: 'Chapter 1 — Exploration: Entering the World of Secondary Science', order:  1, isCustom: false },
        { subjectId: 4, name: 'Chapter 2 — The Building Blocks of Life',       order:  2, isCustom: false },
        { subjectId: 4, name: 'Chapter 3 — Tissues in Action',                 order:  3, isCustom: false },
        { subjectId: 4, name: 'Chapter 4 — Describing Motion Around Us',       order:  4, isCustom: false },
        { subjectId: 4, name: 'Chapter 5 — Exploring Mixtures and Their Separation', order: 5, isCustom: false },
        { subjectId: 4, name: 'Chapter 6 — How Forces Affect Motion',          order:  6, isCustom: false },
        { subjectId: 4, name: 'Chapter 7 — Work, Energy, and Simple Machines', order:  7, isCustom: false },
        { subjectId: 4, name: 'Chapter 8 — Journey Inside the Atom',           order:  8, isCustom: false },
        { subjectId: 4, name: 'Chapter 9 — Atomic Foundations of Matter',      order:  9, isCustom: false },
        { subjectId: 4, name: 'Chapter 10 — Sound Waves: Characteristics and Applications', order: 10, isCustom: false },
        { subjectId: 4, name: 'Chapter 11 — Reproduction: How Life Continues', order: 11, isCustom: false },
        { subjectId: 4, name: 'Chapter 12 — Patterns in Life: Diversity and Classification', order: 12, isCustom: false },
        { subjectId: 4, name: 'Chapter 13 — Earth as a System: Energy, Matter, and Life', order: 13, isCustom: false },

        /* ─── Mathematics — Ganita Manjari (subjectId: 5) ─── */
        { subjectId: 5, name: 'Chapter 1 — The World of Numbers',              order:  1, isCustom: false },
        { subjectId: 5, name: 'Chapter 2 — The Use of Coordinates',            order:  2, isCustom: false },
        { subjectId: 5, name: 'Chapter 3 — Introduction to Linear Polynomials',order:  3, isCustom: false },
        { subjectId: 5, name: 'Chapter 4 — Exploring Algebraic Identities',    order:  4, isCustom: false },
        { subjectId: 5, name: "Chapter 5 — I'm Up and Down, and Round and Round", order: 5, isCustom: false },
        { subjectId: 5, name: 'Chapter 6 — Measuring Space: Perimeter and Area', order: 6, isCustom: false },
        { subjectId: 5, name: 'Chapter 7 — The Mathematics of Maybe: Introduction to Probability', order: 7, isCustom: false },
        { subjectId: 5, name: 'Chapter 8 — Exploring Sequences and Progressions', order: 8, isCustom: false },

        /* ─── Social Science (subjectId: 6) ─── */
        { subjectId: 6, name: 'Chapter 1 — Understanding Social Science',      order:  1, isCustom: false },
        { subjectId: 6, name: "Chapter 2 — Shaping of the Earth's Surface",    order:  2, isCustom: false },
        { subjectId: 6, name: 'Chapter 3 — Atmosphere and Climate',            order:  3, isCustom: false },
        { subjectId: 6, name: 'Chapter 4 — Early Humans and Beginning of Civilization', order: 4, isCustom: false },
        { subjectId: 6, name: 'Chapter 5 — State and Society up to 1000 CE',   order:  5, isCustom: false },
        { subjectId: 6, name: 'Chapter 6 — Understanding Democracy',           order:  6, isCustom: false },
        { subjectId: 6, name: 'Chapter 7 — Elections',                         order:  7, isCustom: false },
        { subjectId: 6, name: 'Chapter 8 — Building Blocks in Economics: The Problem of Choice', order: 8, isCustom: false },
        { subjectId: 6, name: 'Chapter 9 — The Price Puzzle: What Drives the Market', order: 9, isCustom: false },

        /* ─── IT — Code 402 (subjectId: 7) ─── */
        { subjectId: 7, name: 'Part A · Unit 1 — Communication Skills',         order:  1, isCustom: false },
        { subjectId: 7, name: 'Part A · Unit 2 — Self-Management Skills',        order:  2, isCustom: false },
        { subjectId: 7, name: 'Part A · Unit 3 — Basic ICT Skills',              order:  3, isCustom: false },
        { subjectId: 7, name: 'Part A · Unit 4 — Entrepreneurial Skills',        order:  4, isCustom: false },
        { subjectId: 7, name: 'Part A · Unit 5 — Green Skills',                  order:  5, isCustom: false },
        { subjectId: 7, name: 'Part B · Unit 1 — Introduction to IT-ITeS Industry', order: 6, isCustom: false },
        { subjectId: 7, name: 'Part B · Unit 2 — Data Entry and Keyboarding Skills', order: 7, isCustom: false },
        { subjectId: 7, name: 'Part B · Unit 3 — Digital Documentation',         order:  8, isCustom: false },
        { subjectId: 7, name: 'Part B · Unit 4 — Electronic Spreadsheet',        order:  9, isCustom: false },
        { subjectId: 7, name: 'Part B · Unit 5 — Digital Presentation',          order: 10, isCustom: false },
    ]
};

/* ── Seed database on first launch ── */
async function seedDatabase() {
    const seeded = await DB.getSetting('seeded_v2');
    if (seeded) return;

    for (const subj of SEED.subjects) {
        await DB.put('subjects', subj);
    }

    for (const ch of SEED.chapters) {
        await DB.put('chapters', ch);
    }

    /* Initialize streak */
    await DB.put('streak', { id: 'main', count: 0, lastActiveDate: null });

    await DB.setSetting('seeded_v2', true);
    console.log('[StudyFlow] Database seeded with NCERT Grade 9 data ✓');
}
