const TaskManager = (() => {
  'use strict';
  let tasks = JSON.parse(localStorage.getItem('pomodoro_tasks') || '[]');

  function save() { localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks)); }

  function add(text) {
    tasks.push({ id: Date.now(), text, done: false, pomodoros: 0 });
    save();
  }

  function toggle(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; save(); }
  }

  function remove(id) { tasks = tasks.filter(t => t.id !== id); save(); }

  function incrementPomodoro(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.pomodoros++; save(); }
  }

  function getAll() { return [...tasks]; }

  return { add, toggle, remove, incrementPomodoro, getAll };
})();
