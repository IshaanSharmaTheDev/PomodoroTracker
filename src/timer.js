const PomodoroTimer = (() => {
  'use strict';
  let _interval = null;
  let _remaining = 0;
  let _total = 0;
  let _running = false;
  let _onTick = null;
  let _onComplete = null;

  function start(seconds, onTick, onComplete) {
    if (_running) return;
    _remaining = seconds;
    _total = seconds;
    _onTick = onTick;
    _onComplete = onComplete;
    _running = true;
    _interval = setInterval(tick, 1000);
  }

  function resume() {
    if (_running || _remaining <= 0) return;
    _running = true;
    _interval = setInterval(tick, 1000);
  }

  function pause() {
    _running = false;
    clearInterval(_interval);
  }

  function reset() {
    pause();
    _remaining = _total;
    if (_onTick) _onTick(_remaining, _total);
  }

  function tick() {
    _remaining--;
    if (_onTick) _onTick(_remaining, _total);
    if (_remaining <= 0) {
      pause();
      if (_onComplete) _onComplete();
    }
  }

  function setRemaining(s) { _remaining = s; _total = s; }
  function getRemaining() { return _remaining; }
  function isRunning() { return _running; }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  return { start, resume, pause, reset, setRemaining, getRemaining, isRunning, formatTime };
})();
