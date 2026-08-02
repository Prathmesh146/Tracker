/* ============================================================
   STUDYFLOW  |  js/search.js
   Global Search & Smart Filter Chips
   ============================================================ */
'use strict';

const Search = (() => {
    let _debounce  = null;
    let _activeFilters = new Set();
    let _allTasks    = [];
    let _allSubjects = [];
    let _allChapters = [];

    /* ─── Load all data for searching ─── */
    async function loadAll() {
        _allTasks    = await DB.getAll('tasks');
        _allSubjects = await DB.getAll('subjects');
        _allChapters = await DB.getAll('chapters');
    }

    /* ─── Render results ─── */
    async function render() {
        await loadAll();
        const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
        const container = document.getElementById('search-results');
        const placeholder = document.getElementById('search-placeholder');

        if (!query && _activeFilters.size === 0) {
            if (placeholder) placeholder.classList.remove('hidden');
            /* Show only placeholder */
            container.innerHTML = '';
            container.appendChild(placeholder || buildPlaceholder());
            return;
        }

        if (placeholder) placeholder.classList.add('hidden');

        const today = DB.todayStr();

        let results = _allTasks.filter(task => {
            /* Text search */
            if (query) {
                const subj = _allSubjects.find(s => s.id === task.subjectId);
                const chap = _allChapters.find(c => c.id === task.chapterId);
                const blob = [
                    task.title,
                    task.notes || '',
                    subj ? `${subj.name} ${subj.subtitle}` : '',
                    chap ? chap.name : '',
                ].join(' ').toLowerCase();
                if (!blob.includes(query)) return false;
            }

            /* Filters */
            if (_activeFilters.has('pending') && task.status === 'done')   return false;
            if (_activeFilters.has('done')    && task.status !== 'done')   return false;
            if (_activeFilters.has('today')   && task.dueDate !== today)   return false;
            if (_activeFilters.has('urgent')  && task.priority !== 'urgent') return false;

            return true;
        });

        /* Sort: urgent first, then by due date */
        results.sort((a, b) => {
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
            if (b.priority === 'urgent' && a.priority !== 'urgent') return  1;
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return  1;
            return 0;
        });

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon-wrap">🔍</div>
                    <p class="empty-title">No results found</p>
                    <p class="empty-sub">Try different search terms or filters</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();
        for (const task of results) {
            const subj = _allSubjects.find(s => s.id === task.subjectId);
            const chap = _allChapters.find(c => c.id === task.chapterId);
            const card = Dashboard.buildTaskCard(task, subj, chap);
            fragment.appendChild(card);
        }
        container.appendChild(fragment);
    }

    function buildPlaceholder() {
        const d = document.createElement('div');
        d.id = 'search-placeholder';
        d.className = 'search-placeholder';
        d.innerHTML = `
            <div class="empty-icon-wrap" style="font-size:2.5rem">🔍</div>
            <p class="empty-title">Start typing to search</p>
            <p class="empty-sub">Searches across tasks, chapters & subjects</p>
        `;
        return d;
    }

    /* ─── Init ─── */
    function init() {
        const input = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');

        input?.addEventListener('input', () => {
            const v = input.value;
            clearBtn?.classList.toggle('hidden', !v);
            clearTimeout(_debounce);
            _debounce = setTimeout(() => render(), 220);
        });

        clearBtn?.addEventListener('click', () => {
            input.value = '';
            clearBtn.classList.add('hidden');
            _activeFilters.clear();
            syncChipUI();
            render();
            input.focus();
        });

        /* Filter chips */
        document.querySelectorAll('#filter-chips .chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const f = chip.dataset.filter;
                if (_activeFilters.has(f)) {
                    _activeFilters.delete(f);
                    chip.classList.remove('active');
                } else {
                    /* Only one status filter at a time */
                    if (f === 'done' && _activeFilters.has('pending')) _activeFilters.delete('pending');
                    if (f === 'pending' && _activeFilters.has('done')) _activeFilters.delete('done');
                    _activeFilters.add(f);
                    chip.classList.add('active');
                }
                syncChipUI();
                render();
            });
        });
    }

    function syncChipUI() {
        document.querySelectorAll('#filter-chips .chip').forEach(chip => {
            chip.classList.toggle('active', _activeFilters.has(chip.dataset.filter));
        });
    }

    function refresh() {
        if (document.getElementById('view-search')?.classList.contains('active')) {
            render();
        }
    }

    return { init, render, refresh };
})();
