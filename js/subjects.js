/* ============================================================
   STUDYFLOW  |  js/subjects.js
   Subject Hubs, Chapter Accordion, Progress Calculations
   ============================================================ */
'use strict';

const Subjects = (() => {
    let _activeSubject  = null;
    let _subjects       = [];
    let _chapters       = [];
    let _progressCache  = {};

    const SUB_TASKS = [
        { key: 'taught',    label: 'Taught in Class',         icon: '🎓' },
        { key: 'classwork', label: 'Classwork / Notebook Done', icon: '📝' },
        { key: 'homework',  label: 'Homework Submitted',       icon: '📤' },
        { key: 'revision',  label: 'Revision Done',            icon: '🔄' },
    ];

    /* ─── Load all progress ─── */
    async function loadProgress() {
        const all = await DB.getAll('chapterProgress');
        _progressCache = {};
        for (const p of all) _progressCache[p.chapterId] = p;
    }

    /* ─── Calculate progress for a subject ─── */
    function calcSubjectProgress(subjectId) {
        const chapters = _chapters.filter(c => c.subjectId === subjectId);
        if (!chapters.length) return 0;

        let total     = 0;
        let completed = 0;

        for (const ch of chapters) {
            const prog = _progressCache[ch.id];
            for (const st of SUB_TASKS) {
                total++;
                if (prog && prog[st.key]) completed++;
            }
        }

        return total ? Math.round((completed / total) * 100) : 0;
    }

    /* ─── Render Subject Grid ─── */
    async function renderGrid() {
        _subjects  = await DB.getAll('subjects');
        _chapters  = await DB.getAll('chapters');
        await loadProgress();
        _subjects.sort((a, b) => a.order - b.order);

        const grid = document.getElementById('subject-grid');
        if (!grid) return;
        grid.innerHTML = '';

        for (const subj of _subjects) {
            const pct   = calcSubjectProgress(subj.id);
            const count = _chapters.filter(c => c.subjectId === subj.id).length;
            const card  = buildSubjectCard(subj, pct, count);
            grid.appendChild(card);
        }
    }

    function buildSubjectCard(subj, pct, chapCount) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.style.setProperty('--subject-color', subj.color);
        card.setAttribute('data-subject-id', subj.id);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Open ${subj.name}`);

        card.innerHTML = `
            <span class="subject-card-icon">${subj.icon}</span>
            <div class="subject-card-name">${subj.name}</div>
            <div class="subject-card-book">${subj.subtitle}</div>
            <div class="subject-card-progress">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" style="width:${pct}%; background:${subj.color}"></div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:4px;">
                    <span class="subject-card-chap-count">${chapCount} chapters</span>
                    <span class="subject-card-pct" style="color:${subj.color}">${pct}%</span>
                </div>
            </div>
        `;

        const open = () => openPanel(subj.id);
        card.addEventListener('click', open);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(); });

        return card;
    }

    /* ─── Open Subject Panel ─── */
    async function openPanel(subjectId) {
        _activeSubject = _subjects.find(s => s.id === subjectId);
        if (!_activeSubject) return;

        await loadProgress();

        const subj = _activeSubject;

        /* Set panel title */
        document.getElementById('panel-subject-name').textContent = subj.name;
        document.getElementById('panel-subject-book').textContent = subj.subtitle;
        document.getElementById('panel-subject-icon').textContent = subj.icon;

        const iconWrap = document.getElementById('panel-subject-icon-wrap');
        iconWrap.style.setProperty('--subject-color-dim', hexToRgba(subj.color, 0.12));
        iconWrap.style.setProperty('--subject-color-border', hexToRgba(subj.color, 0.25));
        iconWrap.style.backgroundColor = hexToRgba(subj.color, 0.12);
        iconWrap.style.borderColor     = hexToRgba(subj.color, 0.25);

        /* Progress bar */
        const pct  = calcSubjectProgress(subjectId);
        const fill = document.getElementById('panel-progress-fill');
        const pctTxt = document.getElementById('panel-progress-pct');
        if (fill) { fill.style.width = '0%'; fill.style.background = subj.color; }
        if (pctTxt) pctTxt.style.color = subj.color;
        setTimeout(() => {
            if (fill) fill.style.width = pct + '%';
            if (pctTxt) pctTxt.textContent = pct + '%';
        }, 80);

        /* Render chapters */
        await renderChapterList(subjectId);

        /* Show panel */
        const panel    = document.getElementById('subject-panel');
        const backdrop = document.getElementById('panel-backdrop');
        panel.classList.add('panel-open');
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => backdrop.classList.add('backdrop-visible'));
        document.body.style.overflow = 'hidden';
    }

    /* ─── Close Panel ─── */
    function closePanel() {
        const panel    = document.getElementById('subject-panel');
        const backdrop = document.getElementById('panel-backdrop');
        panel.classList.remove('panel-open');
        backdrop.classList.remove('backdrop-visible');
        setTimeout(() => { backdrop.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
        _activeSubject = null;
    }

    /* ─── Render Chapter List ─── */
    async function renderChapterList(subjectId) {
        const chapters = _chapters.filter(c => c.subjectId === subjectId);
        chapters.sort((a, b) => a.order - b.order);

        const list = document.getElementById('chapter-list');
        if (!list) return;
        list.innerHTML = '';

        for (const ch of chapters) {
            const item = buildChapterItem(ch);
            list.appendChild(item);
        }
    }

    function buildChapterItem(ch) {
        const prog = _progressCache[ch.id] || {};
        const completed = SUB_TASKS.filter(st => prog[st.key]).length;
        const isComplete = completed === SUB_TASKS.length;

        const item = document.createElement('div');
        item.className = 'chapter-item' + (isComplete ? ' chapter-complete' : '');
        item.setAttribute('data-chapter-id', ch.id);

        const pctRing = Math.round((completed / SUB_TASKS.length) * 100);

        item.innerHTML = `
            <div class="chapter-header">
                <div class="chapter-mini-progress">
                    <div class="chapter-mini-ring"></div>
                    <div class="chapter-mini-fill" style="border-top-color: ${isComplete ? 'var(--success)' : 'var(--primary)'}; transform: rotate(${-90 + (pctRing / 100) * 360}deg);"></div>
                    <span class="chapter-mini-num">${completed}/4</span>
                </div>
                <div class="chapter-name">${ch.name}</div>
                ${ch.isCustom ? '<span class="chapter-badge">✏️</span>' : ''}
                <svg class="chapter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="chapter-body">
                <div class="chapter-tasks">
                    ${SUB_TASKS.map(st => `
                        <div class="sub-task-row ${prog[st.key] ? 'sub-done' : ''}" data-key="${st.key}" data-chapter-id="${ch.id}" role="checkbox" aria-checked="${!!prog[st.key]}" tabindex="0">
                            <div class="sub-checkbox ${prog[st.key] ? 'checked' : ''}">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span class="sub-task-icon">${st.icon}</span>
                            <span class="sub-task-label">${st.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        /* Expand/collapse */
        const header = item.querySelector('.chapter-header');
        header.addEventListener('click', () => {
            const isOpen = item.classList.contains('expanded');
            /* Close others */
            document.querySelectorAll('.chapter-item.expanded').forEach(el => el.classList.remove('expanded'));
            if (!isOpen) item.classList.add('expanded');
        });

        /* Sub-task checkboxes */
        item.querySelectorAll('.sub-task-row').forEach(row => {
            const toggle = () => handleSubCheck(row);
            row.addEventListener('click', toggle);
            row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggle(); });
        });

        return item;
    }

    /* ─── Handle sub-checkbox click ─── */
    async function handleSubCheck(row) {
        const chapterId = Number(row.dataset.chapterId);
        const key       = row.dataset.key;

        const prog = await DB.get('chapterProgress', chapterId) || { chapterId };
        prog[key] = !prog[key];
        await DB.put('chapterProgress', prog);

        /* Update cache */
        _progressCache[chapterId] = prog;

        /* Update UI */
        const cb = row.querySelector('.sub-checkbox');
        if (prog[key]) {
            cb.classList.add('checked', 'just-checked');
            row.classList.add('sub-done');
            row.setAttribute('aria-checked', 'true');
            setTimeout(() => cb.classList.remove('just-checked'), 400);
        } else {
            cb.classList.remove('checked');
            row.classList.remove('sub-done');
            row.setAttribute('aria-checked', 'false');
        }

        /* Refresh mini-ring & chapter item */
        const item = row.closest('.chapter-item');
        if (item) refreshChapterItemUI(item, chapterId);

        /* Update panel progress bar */
        if (_activeSubject) {
            const pct  = calcSubjectProgress(_activeSubject.id);
            const fill = document.getElementById('panel-progress-fill');
            const txt  = document.getElementById('panel-progress-pct');
            if (fill) fill.style.width = pct + '%';
            if (txt)  txt.textContent  = pct + '%';
        }

        /* Update streak (at least 1 item done today counts) */
        if (prog[key]) {
            const streak = await DB.updateStreak();
            App.updateStreakUI(streak);
        }

        /* Refresh dashboard & subjects grid in background */
        Dashboard.render().catch(() => {});
        renderGrid().catch(() => {});
    }

    function refreshChapterItemUI(item, chapterId) {
        const prog = _progressCache[chapterId] || {};
        const completed = SUB_TASKS.filter(st => prog[st.key]).length;
        const isComplete = completed === SUB_TASKS.length;
        const pctRing = Math.round((completed / SUB_TASKS.length) * 100);

        item.classList.toggle('chapter-complete', isComplete);

        const ring = item.querySelector('.chapter-mini-fill');
        if (ring) {
            ring.style.borderTopColor = isComplete ? 'var(--success)' : 'var(--primary)';
            ring.style.transform = `rotate(${-90 + (pctRing / 100) * 360}deg)`;
        }

        const num = item.querySelector('.chapter-mini-num');
        if (num) num.textContent = `${completed}/4`;
    }

    /* ─── Add Custom Chapter ─── */
    async function addCustomChapter(name) {
        if (!_activeSubject) return;

        const existing = _chapters.filter(c => c.subjectId === _activeSubject.id);
        const maxOrder = existing.reduce((m, c) => Math.max(m, c.order), 0);

        const newChap = {
            subjectId: _activeSubject.id,
            name,
            order:     maxOrder + 1,
            isCustom:  true,
        };

        const id = await DB.put('chapters', newChap);
        newChap.id = id;
        _chapters.push(newChap);

        await renderChapterList(_activeSubject.id);
        await renderGrid();
        App.showToast('✏️ Custom chapter added!', 'success');
    }

    /* ─── Hex to rgba ─── */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    /* ─── Init ─── */
    function init() {
        /* Panel back button */
        document.getElementById('panel-back')?.addEventListener('click', closePanel);
        document.getElementById('panel-backdrop')?.addEventListener('click', closePanel);

        /* Add task from panel */
        document.getElementById('panel-add-task-btn')?.addEventListener('click', () => {
            closePanel();
            setTimeout(() => QuickAdd.open(_activeSubject?.id || null), 350);
        });

        /* Add custom chapter button */
        document.getElementById('add-custom-chapter-btn')?.addEventListener('click', () => {
            document.getElementById('custom-chapter-name').value = '';
            document.getElementById('chapter-modal-overlay').classList.remove('hidden');
        });

        /* Custom chapter modal */
        document.getElementById('chapter-modal-close')?.addEventListener('click', () => {
            document.getElementById('chapter-modal-overlay').classList.add('hidden');
        });

        document.getElementById('chapter-cancel')?.addEventListener('click', () => {
            document.getElementById('chapter-modal-overlay').classList.add('hidden');
        });

        document.getElementById('chapter-submit')?.addEventListener('click', async () => {
            const name = document.getElementById('custom-chapter-name').value.trim();
            if (!name) { App.showToast('⚠️ Please enter a chapter name.', 'error'); return; }
            document.getElementById('chapter-modal-overlay').classList.add('hidden');
            await addCustomChapter(name);
        });

        document.getElementById('custom-chapter-name')?.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                document.getElementById('chapter-submit').click();
            }
        });
    }

    /* ─── Public getters ─── */
    async function getSubjectsWithProgress() {
        if (!_subjects.length) _subjects = await DB.getAll('subjects');
        if (!_chapters.length) _chapters = await DB.getAll('chapters');
        await loadProgress();
        return _subjects.map(s => ({
            ...s,
            progress: calcSubjectProgress(s.id),
            chapterCount: _chapters.filter(c => c.subjectId === s.id).length,
        }));
    }

    return {
        init,
        renderGrid,
        openPanel,
        closePanel,
        getSubjectsWithProgress,
    };
})();
