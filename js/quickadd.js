/* ============================================================
   STUDYFLOW  |  js/quickadd.js
   Quick-Add Task Modal — Form Logic, Image Compression
   ============================================================ */
'use strict';

const QuickAdd = (() => {
    let _selectedPriority = 'normal';
    let _compressedImageData = null;
    let _prefilledSubjectId  = null;

    /* ─── DOM refs ─── */
    const overlay    = () => document.getElementById('quickadd-overlay');
    const titleInput = () => document.getElementById('qa-title');
    const subjSel    = () => document.getElementById('qa-subject');
    const chapSel    = () => document.getElementById('qa-chapter');
    const dateInput  = () => document.getElementById('qa-date');
    const notesInput = () => document.getElementById('qa-notes');
    const imageInput = () => document.getElementById('qa-image');

    /* ─── Open ─── */
    async function open(prefilledSubjectId = null) {
        _selectedPriority   = 'normal';
        _compressedImageData = null;
        _prefilledSubjectId  = prefilledSubjectId;

        resetForm();
        overlay().classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        await populateSubjects(prefilledSubjectId);

        /* Default due date = today */
        dateInput().value = DB.todayStr();

        setTimeout(() => titleInput().focus(), 300);
    }

    /* ─── Close ─── */
    function close() {
        overlay().classList.add('hidden');
        document.body.style.overflow = '';
        resetForm();
    }

    /* ─── Reset ─── */
    function resetForm() {
        const f = overlay();
        if (!f) return;
        const t = titleInput(); if (t) t.value = '';
        const n = notesInput(); if (n) n.value = '';
        _compressedImageData = null;
        resetImagePreview();
        setPriority('normal');
        const cs = chapSel();
        if (cs) { cs.innerHTML = '<option value="">Select Chapter</option>'; cs.disabled = true; }
    }

    function resetImagePreview() {
        const area = document.getElementById('image-upload-wrap');
        const preview = document.getElementById('image-preview-area');
        if (!preview) return;
        preview.className = 'image-preview-empty';
        preview.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Tap to attach a photo</span>
        `;
        const inp = imageInput(); if (inp) inp.value = '';
    }

    /* ─── Populate Subjects dropdown ─── */
    async function populateSubjects(prefilledId) {
        const subjects = await DB.getAll('subjects');
        subjects.sort((a, b) => a.order - b.order);

        const sel = subjSel();
        sel.innerHTML = '<option value="">Select Subject</option>';
        for (const s of subjects) {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.icon} ${s.name}`;
            sel.appendChild(opt);
        }

        if (prefilledId) {
            sel.value = prefilledId;
            await populateChapters(prefilledId);
        }
    }

    /* ─── Populate Chapters dropdown ─── */
    async function populateChapters(subjectId) {
        const cs = chapSel();
        cs.innerHTML = '<option value="">Select Chapter</option>';

        if (!subjectId) { cs.disabled = true; return; }

        const chapters = await DB.getByIndex('chapters', 'subjectId', Number(subjectId));
        chapters.sort((a, b) => a.order - b.order);

        for (const c of chapters) {
            const opt = document.createElement('option');
            opt.value = c.id;
            /* Show ✏️ for custom chapters */
            opt.textContent = (c.isCustom ? '✏️ ' : '') + c.name;
            cs.appendChild(opt);
        }

        cs.disabled = chapters.length === 0;
    }

    /* ─── Priority ─── */
    function setPriority(p) {
        _selectedPriority = p;
        document.getElementById('prio-normal').classList.toggle('active', p === 'normal');
        document.getElementById('prio-urgent').classList.toggle('active', p === 'urgent');
    }

    /* ─── Image Compression ─── */
    function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_W  = 1000;
                    const MAX_H  = 750;

                    let w = img.width;
                    let h = img.height;

                    if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
                    if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }

                    canvas.width  = w;
                    canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                    /* Try quality 0.75, reduce if > 500KB */
                    let quality = 0.75;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);

                    /* Rough size check: base64 ≈ 1.33× binary */
                    while (dataUrl.length * 0.75 > 500 * 1024 && quality > 0.2) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve(dataUrl);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /* ─── Submit ─── */
    async function submit() {
        const title   = titleInput().value.trim();
        const subjId  = Number(subjSel().value);
        const chapId  = Number(chapSel().value) || null;
        const dueDate = dateInput().value || null;
        const notes   = notesInput().value.trim();

        if (!title)  { App.showToast('⚠️ Please enter a task title.', 'error'); titleInput().focus(); return; }
        if (!subjId) { App.showToast('⚠️ Please select a subject.', 'error'); subjSel().focus(); return; }

        const task = {
            title,
            subjectId: subjId,
            chapterId: chapId,
            dueDate,
            priority:  _selectedPriority,
            status:    'pending',
            notes,
            imageData: _compressedImageData || null,
            createdAt: new Date().toISOString(),
        };

        await DB.put('tasks', task);
        close();
        App.showToast('✅ Task added successfully!', 'success');
        await App.refresh();
    }

    /* ─── Init (bind events) ─── */
    function init() {
        /* Close buttons */
        document.getElementById('quickadd-close')?.addEventListener('click', close);
        document.getElementById('qa-cancel')?.addEventListener('click', close);
        overlay()?.addEventListener('click', (e) => { if (e.target === overlay()) close(); });

        /* Subject change → load chapters */
        subjSel()?.addEventListener('change', async (e) => {
            await populateChapters(e.target.value);
        });

        /* Priority buttons */
        document.getElementById('prio-normal')?.addEventListener('click', () => setPriority('normal'));
        document.getElementById('prio-urgent')?.addEventListener('click', () => setPriority('urgent'));

        /* Image upload */
        const uploadWrap = document.getElementById('image-upload-wrap');
        uploadWrap?.addEventListener('click', () => imageInput()?.click());

        imageInput()?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            App.showToast('⏳ Compressing image…', 'success');
            _compressedImageData = await compressImage(file);

            const preview = document.getElementById('image-preview-area');
            preview.className = 'image-preview-filled';
            preview.innerHTML = `
                <img src="${_compressedImageData}" alt="Attached photo" />
                <button class="image-remove-btn" id="image-remove-btn" aria-label="Remove image">✕</button>
            `;
            document.getElementById('image-remove-btn').addEventListener('click', (ev) => {
                ev.stopPropagation();
                _compressedImageData = null;
                resetImagePreview();
            });
        });

        /* Submit */
        document.getElementById('qa-submit')?.addEventListener('click', submit);

        /* Enter key on title */
        titleInput()?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    }

    return { init, open, close };
})();
