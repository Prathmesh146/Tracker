/* ============================================================
   STUDYFLOW  |  js/db.js
   IndexedDB Abstraction Layer — Promise-based CRUD
   ============================================================ */
'use strict';

const DB = (() => {
    const DB_NAME    = 'StudyFlowDB_v2';
    const DB_VERSION = 1;
    let _db = null;

    /* ─── Open / Upgrade ─── */
    function init() {
        return new Promise((resolve, reject) => {
            if (_db) { resolve(_db); return; }

            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = (e) => {
                const db = e.target.result;

                /* subjects */
                if (!db.objectStoreNames.contains('subjects')) {
                    const s = db.createObjectStore('subjects', { keyPath: 'id' });
                    s.createIndex('order', 'order', { unique: false });
                }

                /* chapters */
                if (!db.objectStoreNames.contains('chapters')) {
                    const c = db.createObjectStore('chapters', { keyPath: 'id', autoIncrement: true });
                    c.createIndex('subjectId', 'subjectId', { unique: false });
                }

                /* chapterProgress — one record per chapter (keyed by chapterId) */
                if (!db.objectStoreNames.contains('chapterProgress')) {
                    db.createObjectStore('chapterProgress', { keyPath: 'chapterId' });
                }

                /* tasks */
                if (!db.objectStoreNames.contains('tasks')) {
                    const t = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
                    t.createIndex('subjectId', 'subjectId', { unique: false });
                    t.createIndex('dueDate',   'dueDate',   { unique: false });
                    t.createIndex('status',    'status',    { unique: false });
                    t.createIndex('priority',  'priority',  { unique: false });
                }

                /* streak — single record */
                if (!db.objectStoreNames.contains('streak')) {
                    db.createObjectStore('streak', { keyPath: 'id' });
                }

                /* settings */
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
            req.onerror   = (e) => { reject(e.target.error); };
        });
    }

    /* ─── Generic helpers ─── */
    function _tx(store, mode, fn) {
        return new Promise((resolve, reject) => {
            const tx  = _db.transaction(store, mode);
            const st  = tx.objectStore(store);
            const req = fn(st);
            req.onsuccess = () => resolve(req.result);
            req.onerror   = () => reject(req.error);
        });
    }

    function getAll(storeName) {
        return _tx(storeName, 'readonly', s => s.getAll());
    }

    function get(storeName, key) {
        return _tx(storeName, 'readonly', s => s.get(key));
    }

    function getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const tx  = _db.transaction(storeName, 'readonly');
            const st  = tx.objectStore(storeName);
            const idx = st.index(indexName);
            const req = idx.getAll(value);
            req.onsuccess = () => resolve(req.result);
            req.onerror   = () => reject(req.error);
        });
    }

    function put(storeName, data) {
        return _tx(storeName, 'readwrite', s => s.put(data));
    }

    function del(storeName, key) {
        return _tx(storeName, 'readwrite', s => s.delete(key));
    }

    /* ─── Settings helpers ─── */
    function getSetting(key) {
        return get('settings', key).then(r => r ? r.value : null);
    }

    function setSetting(key, value) {
        return put('settings', { key, value });
    }

    /* ─── Streak helpers ─── */
    async function getStreak() {
        const s = await get('streak', 'main');
        return s || { id: 'main', count: 0, lastActiveDate: null };
    }

    async function updateStreak() {
        const today  = todayStr();
        const streak = await getStreak();

        if (streak.lastActiveDate === today) {
            /* already updated today — no increment needed */
            return streak;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const ydStr = fmtDate(yesterday);

        if (streak.lastActiveDate === ydStr) {
            /* consecutive — increment */
            streak.count++;
        } else if (!streak.lastActiveDate) {
            /* first ever */
            streak.count = 1;
        } else {
            /* streak broken — restart */
            streak.count = 1;
        }

        streak.lastActiveDate = today;
        await put('streak', streak);
        return streak;
    }

    /* ─── Date utils ─── */
    function todayStr() {
        return fmtDate(new Date());
    }

    function fmtDate(d) {
        return d.toISOString().slice(0, 10);
    }

    return {
        init,
        getAll,
        get,
        getByIndex,
        put,
        del,
        getSetting,
        setSetting,
        getStreak,
        updateStreak,
        todayStr,
        fmtDate,
    };
})();
