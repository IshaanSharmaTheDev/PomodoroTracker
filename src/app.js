(function () {
  'use strict';
  const CIRCUMFERENCE = 2 * Math.PI * 88;
  let settings = JSON.parse(localStorage.getItem('pomodoro_settings') || 'null') || { work:25, short:5, long:15, sessions:4, sound:true, autostart:false };
  let phase = 'work';
  let sessionCount = 0;
  let sessionLog = JSON.parse(localStorage.getItem('pomodoro_log') || '[]');
  let activeTaskId = null;

  function phaseDuration(p) {
    return (p === 'work' ? settings.work : p === 'short' ? settings.short : settings.long) * 60;
  }

  function setPhase(p) {
    phase = p;
    document.querySelectorAll('.phase-btn').forEach(b => b.classList.toggle('active', b.dataset.phase === p));
    const dur = phaseDuration(p);
    PomodoroTimer.setRemaining(dur);
    updateDisplay(dur, dur);
  }

  function updateDisplay(remaining, total) {
    document.getElementById('time-display').textContent = PomodoroTimer.formatTime(remaining);
    const pct = total > 0 ? remaining / total : 1;
    const offset = CIRCUMFERENCE * (1 - pct);
    document.getElementById('ring-fg').style.strokeDashoffset = offset;
    document.title = `${PomodoroTimer.formatTime(remaining)} — PomodoroTracker`;
  }

  function onComplete() {
    playBeep();
    const label = phase === 'work' ? 'Work' : phase === 'short' ? 'Short Break' : 'Long Break';
    addLog(label, phaseDuration(phase) / 60);
    if (phase === 'work') {
      sessionCount++;
      document.getElementById('session-label').textContent = `Session ${sessionCount + 1}`;
      if (activeTaskId) TaskManager.incrementPomodoro(activeTaskId);
      renderTasks();
      const nextPhase = sessionCount % settings.sessions === 0 ? 'long' : 'short';
      setPhase(nextPhase);
    } else {
      setPhase('work');
    }
    if (settings.autostart) startTimer();
  }

  function startTimer() {
    const dur = phaseDuration(phase);
    PomodoroTimer.start(dur, (r, t) => updateDisplay(r, t), onComplete);
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-pause').disabled = false;
  }

  function addLog(type, minutes) {
    sessionLog.unshift({ type, minutes, at: new Date().toLocaleTimeString() });
    if (sessionLog.length > 50) sessionLog.pop();
    localStorage.setItem('pomodoro_log', JSON.stringify(sessionLog));
    renderLog();
  }

  function renderLog() {
    const list = document.getElementById('log-list');
    list.innerHTML = sessionLog.slice(0, 20).map(e =>
      `<div class="log-item"><span class="log-type ${e.type.toLowerCase().replace(' ','-')}">${e.type}</span><span class="log-min">${e.minutes}m</span><span class="log-at">${e.at}</span></div>`
    ).join('') || '<div class="no-log">No sessions yet</div>';
  }

  function renderTasks() {
    const list = document.getElementById('task-list');
    const tasks = TaskManager.getAll();
    list.innerHTML = tasks.length === 0
      ? '<div class="no-task">Add a task to track</div>'
      : tasks.map(t => `
        <div class="task-item ${t.done ? 'done' : ''} ${activeTaskId === t.id ? 'active-task' : ''}" data-id="${t.id}">
          <input type="checkbox" class="task-check" ${t.done ? 'checked' : ''}/>
          <span class="task-text">${esc(t.text)}</span>
          <span class="task-poms" title="Pomodoros completed">🍅×${t.pomodoros}</span>
          <button class="task-select ${activeTaskId === t.id ? 'selected' : ''}" data-id="${t.id}">▶</button>
          <button class="task-del" data-id="${t.id}">✕</button>
        </div>`).join('');
    list.querySelectorAll('.task-check').forEach(cb => cb.addEventListener('change', function() {
      TaskManager.toggle(parseInt(this.closest('.task-item').dataset.id)); renderTasks();
    }));
    list.querySelectorAll('.task-del').forEach(btn => btn.addEventListener('click', function() {
      TaskManager.remove(parseInt(this.dataset.id)); if (activeTaskId === parseInt(this.dataset.id)) activeTaskId = null; renderTasks();
    }));
    list.querySelectorAll('.task-select').forEach(btn => btn.addEventListener('click', function() {
      activeTaskId = activeTaskId === parseInt(this.dataset.id) ? null : parseInt(this.dataset.id); renderTasks();
    }));
  }

  function playBeep() {
    if (!settings.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = 0.3;
      osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 0.8);
    } catch(e) {}
  }

  function showStats() {
    const workSessions = sessionLog.filter(e => e.type === 'Work').length;
    const totalMins = sessionLog.filter(e => e.type === 'Work').reduce((s, e) => s + e.minutes, 0);
    document.getElementById('stats-content').innerHTML = `
      <div class="stat-item"><span>Total sessions</span><strong>${workSessions}</strong></div>
      <div class="stat-item"><span>Focus time</span><strong>${totalMins} min</strong></div>
      <div class="stat-item"><span>Tasks completed</span><strong>${TaskManager.getAll().filter(t=>t.done).length}</strong></div>
      <div class="stat-item"><span>Pomodoros today</span><strong>${sessionCount}</strong></div>`;
    document.getElementById('stats-modal').classList.remove('hidden');
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function init() {
    setPhase('work');
    renderTasks();
    renderLog();

    document.querySelectorAll('.phase-btn').forEach(b => b.addEventListener('click', () => { PomodoroTimer.pause(); setPhase(b.dataset.phase); document.getElementById('btn-start').disabled=false; document.getElementById('btn-pause').disabled=true; }));
    document.getElementById('btn-start').addEventListener('click', startTimer);
    document.getElementById('btn-pause').addEventListener('click', () => { PomodoroTimer.pause(); document.getElementById('btn-start').disabled=false; document.getElementById('btn-pause').disabled=true; });
    document.getElementById('btn-reset').addEventListener('click', () => { PomodoroTimer.pause(); setPhase(phase); document.getElementById('btn-start').disabled=false; document.getElementById('btn-pause').disabled=true; });
    document.getElementById('btn-skip').addEventListener('click', () => { PomodoroTimer.pause(); onComplete(); });
    document.getElementById('btn-add-task').addEventListener('click', () => {
      const text = prompt('Task name:');
      if (text && text.trim()) { TaskManager.add(text.trim()); renderTasks(); }
    });
    document.getElementById('btn-settings').addEventListener('click', () => {
      document.getElementById('s-work').value = settings.work;
      document.getElementById('s-short').value = settings.short;
      document.getElementById('s-long').value = settings.long;
      document.getElementById('s-sessions').value = settings.sessions;
      document.getElementById('s-sound').checked = settings.sound;
      document.getElementById('s-autostart').checked = settings.autostart;
      document.getElementById('settings-modal').classList.remove('hidden');
    });
    document.getElementById('settings-save').addEventListener('click', () => {
      settings = { work: parseInt(document.getElementById('s-work').value), short: parseInt(document.getElementById('s-short').value), long: parseInt(document.getElementById('s-long').value), sessions: parseInt(document.getElementById('s-sessions').value), sound: document.getElementById('s-sound').checked, autostart: document.getElementById('s-autostart').checked };
      localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
      document.getElementById('settings-modal').classList.add('hidden');
      PomodoroTimer.pause(); setPhase(phase);
    });
    document.getElementById('settings-cancel').addEventListener('click', () => document.getElementById('settings-modal').classList.add('hidden'));
    document.getElementById('btn-stats').addEventListener('click', showStats);
    document.getElementById('stats-close').addEventListener('click', () => document.getElementById('stats-modal').classList.add('hidden'));
  }
  document.addEventListener('DOMContentLoaded', init);
})();
