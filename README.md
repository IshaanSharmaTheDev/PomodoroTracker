# PomodoroTracker

A full-featured Pomodoro productivity timer with task tracking, session logging, and stats.

## Features
- **3 phases** — Work (25m), Short Break (5m), Long Break (15m)
- **Animated ring** — SVG progress ring with smooth countdown
- **Task list** — add tasks, mark done, assign to session, track pomodoros per task
- **Session log** — timestamped history of every completed session
- **Settings modal** — customize all durations, auto-start, sound alerts
- **Web Audio beep** — tone on session complete, no external files
- **Stats** — total sessions, focus time, tasks completed
- **Keyboard shortcuts** — Space, keyboard nav
- **Persistent** — tasks, log, settings all saved to localStorage

## Structure
```
src/timer.js   # Timer state machine (start/pause/resume/reset/tick)
src/tasks.js   # Task CRUD + pomodoro counter
src/app.js     # App controller, phase switching, audio, stats
```

## License
MIT
