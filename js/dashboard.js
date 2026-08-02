/* ============================================================
   STUDYFLOW  |  js/dashboard.js
   Dashboard View — Tasks Today, Pending, Subject Overview,
   Streak Logic, Gold Badge, Confetti
   ============================================================ */
'use strict';

const Dashboard = (() => {

    /* ─── Main Render ─── */
    async function render() {
        const today    = DB.todayStr();
        const tasks    = await DB.getAll('tasks');
        const subjects = await DB.getAll('subjects');
        const chapters = await DB.getAll('chapters');

        /* Categorise */
        const todayTasks   = tasks.filter(t => t.dueDate === today && t.status !== 'done');
        const pendingTasks = tasks.filter(t => t.status !== 'done' && t.dueDate !== today);
        const doneTasks    = tasks.filter(t => t.status === 'done');

        /* Update greeting */
        setGreeting();

        /* Stats */
        const allPending = tasks.filter(t => t.status !== 'done');
        setText('stat-today',   todayTasks.length);
        setText('stat-pending', allPending.length);
        setText('stat-done',    doneTasks.length);
        setText('today-badge',  todayTasks.length);
        setText('pending-badge', pendingTasks.length);

        /* Render task sections */
        renderTaskSection('tasks-today',   'today-empty',   todayTasks,   subjects, chapters);
        renderTaskSection('tasks-pending', 'pending-empty', pendingTasks, subjects, chapters);

        /* Subject overview */
        await renderSubjectOverview(subjects);

        /* Gold badge — all today's tasks done */
        const allTodayDone = tasks
            .filter(t => t.dueDate === today)
            .every(t => t.status === 'done');
        const hasTodayTasks = tasks.some(t => t.dueDate === today);

        const goldBadge = document.getElementById('gold-badge');
        if (goldBadge) {
            if (hasTodayTasks && allTodayDone) {
                goldBadge.classList.remove('hidden');
            } else {
                goldBadge.classList.add('hidden');
            }
        }

        /* Streak UI */
        const streak = await DB.getStreak();
        App.updateStreakUI(streak);
    }

    /* ─── Task Section ─── */
    function renderTaskSection(containerId, emptyId, tasks, subjects, chapters) {
        const container = document.getElementById(containerId);
        const emptyEl   = document.getElementById(emptyId);
        if (!container) return;

        /* Remove previous task cards (keep empty state) */
        Array.from(container.children).forEach(el => {
            if (!el.id || !el.id.includes('empty')) el.remove();
        });

        if (tasks.length === 0) {
            if (emptyEl) emptyEl.classList.remove('hidden');
            return;
        }

        if (emptyEl) emptyEl.classList.add('hidden');

        /* Sort: urgent first, then by due date */
        const sorted = [...tasks].sort((a, b) => {
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
            if (b.priority === 'urgent' && a.priority !== 'urgent') return  1;
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            return 0;
        });

        const fragment = document.createDocumentFragment();
        for (const task of sorted) {
            const subj = subjects.find(s => s.id === task.subjectId);
            const chap = chapters.find(c => c.id === task.chapterId);
            fragment.appendChild(buildTaskCard(task, subj, chap));
        }
        container.appendChild(fragment);
    }

    /* ─── Build Task Card ─── */
    function buildTaskCard(task, subj, chap) {
        const today    = DB.todayStr();
        const isUrgent = task.priority === 'urgent';
        const isDone   = task.status === 'done';

        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority} ${isDone ? 'task-done' : ''}`;
        card.setAttribute('data-task-id', task.id);
        card.setAttribute('role', 'listitem');

        /* Due date tag */
        let dateBadge = '';
        if (task.dueDate) {
            const isOverdue = !isDone && task.dueDate < today;
            const isToday   = task.dueDate === today;
            const cls       = isOverdue ? 'tag-overdue' : isToday ? 'tag-today' : '';
            const label     = isOverdue ? '⚠️ Overdue' : isToday ? '📅 Today' : `📅 ${formatDate(task.dueDate)}`;
            dateBadge = `<span class="task-tag ${cls}">${label}</span>`;
        }

        /* Thumbnail */
        const thumb = task.imageData
            ? `<img class="task-thumb" src="${task.imageData}" alt="Task photo" />`
            : '';

        card.innerHTML = `
            <div class="task-checkbox-wrap">
                <div class="task-checkbox ${isDone ? 'checked' : ''}" role="checkbox" aria-checked="${isDone}" aria-label="Mark task ${isDone ? 'incomplete' : 'complete'}" tabindex="0">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            </div>
            <div class="task-body">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    ${subj ? `<span class="task-tag tag-subject" style="color:${subj.color}; background:${hexToRgba(subj.color,0.1)}; border-color:${hexToRgba(subj.color,0.25)}">${subj.icon} ${subj.name}</span>` : ''}
                    ${chap ? `<span class="task-tag">${truncate(chap.name, 30)}</span>` : ''}
                    ${dateBadge}
                    ${isUrgent ? '<span class="task-tag tag-urgent">🔴 Urgent</span>' : ''}
                    ${isDone   ? '<span class="task-tag tag-done">✅ Done</span>' : ''}
                </div>
            </div>
            ${thumb}
        `;

        /* Checkbox toggle */
        const checkbox = card.querySelector('.task-checkbox');
        const toggleDone = (e) => {
            e.stopPropagation();
            toggleTaskDone(task, card, checkbox);
        };
        checkbox.addEventListener('click', toggleDone);
        checkbox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggleDone(e); });

        /* Card click → detail modal */
        card.addEventListener('click', () => openTaskDetail(task, subj, chap));

        return card;
    }

    /* ─── Toggle Task Done ─── */
    async function toggleTaskDone(task, card, checkbox) {
        const wasDone  = task.status === 'done';
        task.status    = wasDone ? 'pending' : 'done';
        await DB.put('tasks', task);

        /* Animate */
        checkbox.classList.toggle('checked', !wasDone);
        checkbox.classList.add('just-checked');
        card.classList.toggle('task-done', !wasDone);
        setTimeout(() => checkbox.classList.remove('just-checked'), 400);

        if (!wasDone) {
            /* Update streak */
            const streak = await DB.updateStreak();
            App.updateStreakUI(streak);
            App.showToast('🎯 Task completed! Keep going!', 'success');
        }

        await render();
        Search.refresh();
    }

    /* ─── Task Detail Modal ─── */
    async function openTaskDetail(task, subj, chap) {
        const overlay = document.getElementById('task-detail-overlay');
        const titleEl = document.getElementById('detail-title');
        const body    = document.getElementById('task-detail-body');
        const deleteBtn = document.getElementById('task-delete-btn');

        if (!overlay) return;

        titleEl.textContent = task.title;

        const today = DB.todayStr();
        const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

        body.innerHTML = `
            <div class="detail-info-grid">
                <div class="detail-field">
                    <span class="detail-field-label">Subject</span>
                    <span class="detail-field-value">${subj ? `${subj.icon} ${subj.name} · ${subj.subtitle}` : '—'}</span>
                </div>
                ${chap ? `<div class="detail-field"><span class="detail-field-label">Chapter</span><span class="detail-field-value">${chap.name}</span></div>` : ''}
                <div class="detail-field">
                    <span class="detail-field-label">Due Date</span>
                    <span class="detail-field-value" style="color:${isOverdue ? 'var(--danger)' : 'inherit'}">${task.dueDate ? formatDate(task.dueDate) : '—'}${isOverdue ? ' ⚠️' : ''}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-field-label">Priority</span>
                    <span class="detail-field-value">${task.priority === 'urgent' ? '🔴 Urgent' : '🟢 Normal'}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-field-label">Status</span>
                    <span class="detail-field-value">${task.status === 'done' ? '✅ Completed' : '⏳ Pending'}</span>
                </div>
                ${task.notes ? `<div class="detail-field"><span class="detail-field-label">Notes</span><span class="detail-field-value">${escapeHtml(task.notes)}</span></div>` : ''}
                ${task.imageData ? `<div class="detail-image"><img src="${task.imageData}" alt="Task photo" /></div>` : ''}
            </div>
        `;

        overlay.classList.remove('hidden');

        deleteBtn.onclick = async () => {
            if (!confirm('Delete this task?')) return;
            await DB.del('tasks', task.id);
            overlay.classList.add('hidden');
            await render();
            Search.refresh();
            App.showToast('🗑 Task deleted.', 'success');
        };

        document.getElementById('task-detail-close').onclick  = () => overlay.classList.add('hidden');
        document.getElementById('task-detail-close2').onclick = () => overlay.classList.add('hidden');
        overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.add('hidden'); };
    }

    /* ─── Subject Overview (Dashboard) ─── */
    async function renderSubjectOverview(subjects) {
        subjects.sort((a, b) => a.order - b.order);
        const container = document.getElementById('subject-overview');
        if (!container) return;
        container.innerHTML = '';

        const withProgress = await Subjects.getSubjectsWithProgress();

        for (const s of withProgress) {
            const item = document.createElement('div');
            item.className = 'subject-overview-item';
            item.innerHTML = `
                <span class="sub-ov-icon">${s.icon}</span>
                <div class="sub-ov-body">
                    <div class="sub-ov-name">${s.name}</div>
                    <div class="sub-ov-bar">
                        <div class="sub-ov-fill" style="width:${s.progress}%; background:${s.color}"></div>
                    </div>
                </div>
                <span class="sub-ov-pct" style="color:${s.color}">${s.progress}%</span>
            `;
            item.addEventListener('click', () => {
                App.navigate('subjects');
                setTimeout(() => Subjects.openPanel(s.id), 200);
            });
            container.appendChild(item);
        }
    }

    /* ─── Greeting ─── */
    function setGreeting() {
        const h   = new Date().getHours();
        const el  = document.getElementById('greeting-text');
        if (!el) return;
        let text = 'Good Morning! 🌅';
        if (h >= 12 && h < 17) text = 'Good Afternoon! ☀️';
        else if (h >= 17 && h < 21) text = 'Good Evening! 🌇';
        else if (h >= 21) text = 'Good Night! 🌙';
        el.textContent = text;
    }

    /* ─── Confetti ─── */
    function launchConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        const colors = ['#7C6FFF','#00D4AA','#FFD700','#FF6B6B','#A78BFA','#4A9EFF','#FFA502'];
        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: -10,
            r: Math.random() * 6 + 3,
            d: Math.random() * 80 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10,
            speed: Math.random() * 3 + 1,
        }));

        let frame = 0;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 3);
                ctx.stroke();
                p.y += p.speed;
                p.tilt += Math.sin(frame * 0.05) * 0.3;
            });
            frame++;
            if (frame < 120) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        draw();
    }

    /* ─── Helpers ─── */
    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function formatDate(str) {
        if (!str) return '';
        const d = new Date(str + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function truncate(s, n) {
        return s.length > n ? s.slice(0, n) + '…' : s;
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    return { render, buildTaskCard, launchConfetti };
})();
