# STARDUST GAME

A meditative arcade game about movement, light, and the quiet joy of drifting through a starfield. Gather glowing motes, paint constellations, and keep your spark alive.

![Stardust Game](https://img.shields.io/badge/status-playable-ffd6ec) ![License](https://img.shields.io/badge/license-MIT-c9b6ff) ![No Dependencies](https://img.shields.io/badge/dependencies-none-a5f3ff)

---

## ✨ Gameplay

You are a single point of light — a **spark** — drifting through a dark, twinkling void. Your cursor pulls you gently through space with a soft spring physics feel.

- **Drift through the stars** — move your cursor and the spark follows gracefully.
- **Gather glowing motes** — collect pastel orbs that spawn around the screen to score.
- **Paint constellations** — each pickup draws a fleeting line to a nearby mote.
- **Keep moving** — stillness dims your light. If it fades completely, the game ends.
- **Let the cosmos bloom** — chain pickups while moving fast to build your Flow.

Your best score is saved locally in your browser.

---

## 🕹️ Controls

| Action | Input |
|--------|-------|
| Move spark | Move your **mouse** or **finger** anywhere on screen |
| Start / Restart | Click the on-screen button |

That's it. One input. One spark. One flow.

The spark follows your cursor with **spring physics** — not instant snapping — so the movement feels alive and organic rather than mechanical.

---

## ✨ Features

- **Spring-physics cursor follower** — the spark accelerates toward your cursor with damping, creating fluid motion
- **Energy system** — your brightness is tied to your movement speed; stillness dims you
- **Flow meter** — sustained movement builds a Flow meter that increases your pickup radius and score bonus
- **Constellation lines** — each collected mote draws a fading line to a nearby one, creating temporary constellation art
- **Five-color palette** — blush, lavender, aqua, pale gold, and rose — with rotating hue on the spark
- **Dreamy particles & ripples** — soft glowing bursts and expanding rings on every pickup
- **Twinkling background stars** — a living starfield that pulses at its own rhythm
- **Nebula glow** — a soft radial wash follows your spark, tinted by its current hue
- **Screen-wide vignette fade** — gentle motion blur across the whole canvas
- **Persistent high score** — saved via `localStorage`
- **Fully responsive** — works on desktop, tablet, and mobile
- **Zero dependencies** — no frameworks, no build step

---

## 📁 Project Structure

```
stardust-game/
├── index.html      # Main HTML structure
├── style.css       # All styling and animations
├── script.js       # Game logic, rendering, and input
├── README.md       # You are here
└── LICENSE         # MIT License
```

If you prefer a single-file version, you can inline `style.css` and `script.js` into `index.html` — the game works either way.

---

## 🚀 Getting Started

### Play Locally

1. Clone or download this repository.
2. Open `index.html` in any modern browser.
3. Click **Begin** and drift.

No server, no install, no build tools required.

### Clone the Repository

```bash
git clone https://github.com/reyrove/stardust-game.git
cd stardust-game
```

### Run via Local Server (optional)

```bash
# Python 3
python -m http.server 8000

# Node.js (with npx)
npx serve
```

Then visit `http://localhost:8000`.

### Play Online (GitHub Pages)

If GitHub Pages is enabled, the game is playable at:

```
https://reyrove.github.io/stardust-game/
```

---

## 🧠 How It Works

- **Canvas rendering** with `requestAnimationFrame` for a smooth game loop.
- **Delta-time updates** so gameplay speed is consistent across refresh rates.
- **Spring physics** — the spark accelerates toward the cursor with a spring constant (`springK = 30`) and damping (`damping = 6.5`), producing natural, organic motion.
- **Energy system** — `spark.energy` interpolates toward a target based on movement speed, and decays when idle (`idleTimer`). If energy drops below `0.06` after `3.5s` of stillness, the game ends.
- **Flow system** — speed above `120 px/s` builds `flow` toward 1, which widens your pickup radius (`collectR`) and boosts score per mote.
- **Hue rotation** — `spark.hue` cycles through the palette based on movement speed and time, so a fast spark shifts through colors quickly.
- **Constellation lines** — on each pickup, a temporary line is drawn from the collected mote to a random remaining mote, fading over 4 seconds.
- **State machine** for `MENU`, `PLAYING`, and `DEAD` states.

---

## 🎯 Tips & Strategy

- **Keep moving.** Stillness kills. Even small, constant motion keeps your light alive.
- **Sweep, don't chase.** Glide past clusters of motes rather than darting to each one — the collection radius grows with Flow.
- **Build Flow early.** The first 10 seconds are calm. Use them to max out Flow so later pickups score more.
- **Watch the edges.** The spark bounces softly off the walls, but corners can trap you if you're not careful.
- **Trust the physics.** The spring motion has momentum — anticipate where your spark will drift, not just where your cursor is.
- **Score scales with Flow.** A mote picked up at Flow 1.0 is worth ~3× one at Flow 0.

---

## 🛠️ Customization

Easy knobs to turn in `script.js`:

| Variable | Default | What it does |
|----------|---------|--------------|
| `PALETTE` | 5 colors | The color palette for motes and spark |
| `springK` | `30` | Spring stiffness pulling spark toward cursor |
| `damping` | `6.5` | Damping factor — higher = less bouncy |
| `idleTimer` threshold | `3.5` | Seconds of stillness before death |
| `collectR` | `26 + flow * 14` | Pickup radius (grows with Flow) |
| `spawnTimer` interval | formula | Time between mote spawns |
| `gained` | `8 + flow * 22` | Score per mote (scales with Flow) |
| `spark.r` | `5` | Base spark radius |

Colors, fonts, and UI styling live in `style.css`.

---

## 🌐 Browser Support

Works in all modern browsers that support:

- HTML5 Canvas
- `requestAnimationFrame`
- CSS `background-clip: text` (for the gradient title)
- `localStorage` (for high score persistence)

Tested in Chrome, Firefox, Safari, and Edge.

---

## 🗺️ Roadmap

Ideas for future versions:

- [ ] **Ambient audio** — soft chimes on pickup, low drone in background
- [ ] **Constellation persistence** — collected motes permanently etched as a finished constellation on game over
- [ ] **Zen mode** — no failure state, endless drift for relaxation
- [ ] **Time-of-day palette shifts** — palette slowly cycles as you play
- [ ] **Mobile haptics** — gentle vibration on each pickup
- [ ] **Export your constellation** — save your run as a PNG artwork

Contributions welcome — open an issue or PR.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-idea`
3. Commit your changes: `git commit -m "Add my idea"`
4. Push to the branch: `git push origin feature/my-idea`
5. Open a Pull Request.

Please keep changes focused and test in at least two browsers.

---

## 📜 License

MIT — free to use, modify, and distribute. See `LICENSE` for details.

---

## 🙌 Credits

Built as a self-contained movement meditation in vanilla JavaScript. Inspired by flow-state games like *flOw* and *Journey*, and by the quiet beauty of watching dust drift through a sunbeam.

---

## 🔗 Links

- **Repository:** [github.com/reyrove/stardust-game](https://github.com/reyrove/stardust-game)
- **Play Online:** [reyrove.github.io/stardust-game](https://reyrove.github.io/stardust-game/)
- **Report a Bug:** [Issues](https://github.com/reyrove/stardust-game/issues)
- **Request a Feature:** [Issues](https://github.com/reyrove/stardust-game/issues)

---

**Drift. Glow. Bloom. ✦**