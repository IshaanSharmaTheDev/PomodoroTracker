# PomodoroTracker

A Pomodoro timer with session history and basic analytics. 25 minutes on, 5 minutes off, except you can actually configure that.

I built this because the existing Pomodoro apps are either too minimal (just a countdown) or too bloated (syncing to the cloud, accounts, subscriptions). I wanted one that tracks your sessions locally so you can actually see your productivity patterns over time.

## Features

- Configurable work/short break/long break durations
- Long break after 4 Pomodoros (also configurable)
- Browser notifications when timer ends (asks permission once)
- Sound alerts — a soft bell, not a jarring alarm
- Session log — every completed Pomodoro saved to localStorage with timestamp and optional task label
- Weekly stats: sessions per day, total focus time, streak
- Dark/light mode

## How to run

```
git clone https://github.com/AadhhyaSharma/PomodoroTracker
cd PomodoroTracker
# open index.html
```

## Adding task labels

Before starting a session, type what you're working on in the task field. It gets saved with the session in the log so you can look back and see what you actually spent your time on.

## The history

The session history is stored in `localStorage` as JSON. You can export it with the Export button if you want to analyze it elsewhere or back it up.

---

Nothing revolutionary. Just a clean Pomodoro timer that actually remembers what you did. Zero dependencies.
