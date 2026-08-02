/* ============================================================
   STUDYFLOW  |  js/app.js
   Main Application Controller — Router, State, Init
   ============================================================ */
'use strict';

const App = (() => {
    let _currentView = 'dashboard';
    let _prevStreak  = 0;

    /* ══════════════════════════════════════════
       NAVIGATION
    ══════════════════════════════════════════ */
    function navigate(viewId) {
        if (_currentView === viewId) return;

        const current = document.getElementById(`view-${_currentView}`);
        const next    = document.getElementById(`view-${viewId}`);
        if (!current || !next) return;

        current.classList.remove('active');
        next.classList.add('active');
        _currentView = viewId;

        /* Sync nav buttons */
        document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
            btn.setAttribute('aria-selected', btn.dataset.view === viewId);
        });

        /* Lazy-render on first visit */
        if (viewId === 'subjects') {
            Subjects.renderGrid();
        } else if (viewId === 'search') {
            Search.render();
            setTimeout(() => document.getElementById('search-input')?.focus(), 300);
        } else if (viewId === 'dashboard') {
            Dashboard.render();
        }
    }

    /* ══════════════════════════════════════════
       STREAK UI
    ══════════════════════════════════════════ */
    function updateStreakUI(streak) {
        const countEl = document.getElementById('streak-count');
        const badge   = document.getElementById('streak-badge');
        if (!countEl) return;

        const prevCount = parseInt(countEl.textContent) || 0;

        countEl.textContent = streak.count;

        if (streak.count > prevCount && streak.count > 0) {
            /* Animate increment */
            countEl.classList.add('bouncing');
            badge?.classList.add('just-incremented');
            setTimeout(() => {
                countEl.classList.remove('bouncing');
                badge?.classList.remove('just-incremented');
            }, 600);

            if (streak.count > 0 && streak.count % 5 === 0) {
                /* Celebrate every 5 days */
                Dashboard.launchConfetti();
                showToast(`🔥 ${streak.count}-day streak! Incredible!`, 'success');
            }
        }

        _prevStreak = streak.count;
    }

    /* ══════════════════════════════════════════
       TOAST NOTIFICATIONS
    ══════════════════════════════════════════ */
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s var(--ease-in) forwards';
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

    /* ══════════════════════════════════════════
       GLOBAL REFRESH
    ══════════════════════════════════════════ */
    async function refresh() {
        await Dashboard.render();

        if (_currentView === 'subjects') await Subjects.renderGrid();
        if (_currentView === 'search')   Search.refresh();
    }

    /* ══════════════════════════════════════════
       INIT
    ══════════════════════════════════════════ */
    async function init() {
        /* 1. Open DB */
        await DB.init();

        /* 2. Seed NCERT data on first run */
        await seedDatabase();

        /* 3. Bind bottom nav */
        document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
            btn.addEventListener('click', () => navigate(btn.dataset.view));
        });

        /* FAB */
        document.getElementById('nav-quickadd')?.addEventListener('click', () => {
            QuickAdd.open();
        });

        /* Notification button */
        document.getElementById('notif-btn')?.addEventListener('click', () => {
            Notifications.handleBtnClick();
        });

        /* 4. Init all modules */
        QuickAdd.init();
        Subjects.init();
        Search.init();

        /* 5. Render dashboard */
        await Dashboard.render();

        /* 6. Schedule notifications */
        Notifications.init();

        /* 7. Handle back button / keyboard */
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('quickadd-overlay')?.classList.add('hidden');
                document.getElementById('chapter-modal-overlay')?.classList.add('hidden');
                document.getElementById('task-detail-overlay')?.classList.add('hidden');
                Subjects.closePanel();
            }
        });

        /* 8. Online/Offline indicator */
        window.addEventListener('offline', () => showToast('📴 You\'re offline — all data is saved locally.', 'info'));
        window.addEventListener('online',  () => showToast('🌐 You\'re back online!', 'success'));

        console.log('[StudyFlow] 🚀 App initialized — Grade 9 NCERT Tracker ready!');
    }

    /* ══════════════════════════════════════════
       BOOT
    ══════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', init);

    return { navigate, showToast, updateStreakUI, refresh };
})();
