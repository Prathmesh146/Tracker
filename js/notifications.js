/* ============================================================
   STUDYFLOW  |  js/notifications.js
   Web Notifications API — 6 PM Daily Homework Reminder
   ============================================================ */
'use strict';

const Notifications = (() => {
    let _timerId = null;

    async function requestPermission() {
        if (!('Notification' in window)) {
            console.warn('[Notif] Web Notifications not supported.');
            return false;
        }
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied')  return false;

        const result = await Notification.requestPermission();
        return result === 'granted';
    }

    function scheduleReminder() {
        if (_timerId) clearTimeout(_timerId);

        const now    = new Date();
        const target = new Date();
        target.setHours(18, 0, 0, 0); // 6:00 PM

        /* If 6 PM already passed today, schedule for tomorrow */
        if (now >= target) target.setDate(target.getDate() + 1);

        const ms = target.getTime() - now.getTime();
        const h  = Math.floor(ms / 3600000);
        const m  = Math.floor((ms % 3600000) / 60000);

        _timerId = setTimeout(async () => {
            const granted = await requestPermission();
            if (granted) {
                try {
                    new Notification('📚 StudyFlow — 6 PM Reminder', {
                        body:  'Time to check your homework! Open StudyFlow and complete today\'s tasks before bedtime. 🎯',
                        icon:  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="26" font-size="28">📚</text></svg>',
                        badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="26" font-size="28">📚</text></svg>',
                        tag:   'studyflow-reminder',
                        renotify: true,
                    });
                } catch(e) {
                    console.warn('[Notif] Could not show notification:', e);
                }
            }
            scheduleReminder(); // reschedule for next day
        }, ms);

        console.log(`[Notif] 6 PM reminder scheduled in ${h}h ${m}m`);
    }

    async function init() {
        const granted = await requestPermission();
        const btn = document.getElementById('notif-btn');

        if (granted) {
            scheduleReminder();
            if (btn) {
                btn.classList.add('active');
                btn.title = 'Reminders enabled (6:00 PM daily)';
            }
        } else {
            if (btn) btn.title = 'Click to enable homework reminders';
        }
    }

    async function handleBtnClick() {
        const granted = await requestPermission();
        if (granted) {
            scheduleReminder();
            const btn = document.getElementById('notif-btn');
            if (btn) btn.classList.add('active');
            App.showToast('🔔 Reminders enabled! You\'ll be notified at 6 PM daily.', 'success');
        } else {
            App.showToast('🔕 Please enable notifications in your browser settings.', 'error');
        }
    }

    return { init, handleBtnClick };
})();
