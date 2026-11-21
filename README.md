# makefun-spot-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nofrizal05/makefun-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nofrizal05/makefun-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Mirror Meadow** — an original spot-the-difference game, built for make.fun's
"Make the best spot the difference game" bounty ($50 in USDC).

Bounty page: https://make.fun/bounty/best-spot-the-difference-game-20261121-0451

## The game

Two near-identical pictures side by side, seven tiny changes hidden between
them. Click a difference on either picture to mark it — a red ring appears on
both panels, a chime plays, and your streak grows. Three original scenes,
drawn procedurally on canvas (no photos, no downloads, nothing copied):

1. **Mirror Meadow** — a sunny garden (easy)
2. **Harbour at Dusk** — boats, gulls and a lighthouse (medium)
3. **Cabin in the Snow** — a quiet mountain night (hard)

Each level has 7 differences, a timer counting up against a par time, 3 hints
(a gold ring pulses over an unfound difference), a +5 second penalty and screen
shake for wrong clicks, and a score with a streak bonus.

## Controls

- **Mouse click** — mark a difference on either picture
- **H** — use a hint
- **1 / 2 / 3** — pick a level
- **R** — restart
- **Esc** — back to the menu
- **M** — mute

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The game runs entirely offline from static
files under `game/`; all sounds are synthesized with WebAudio oscillators.

Screenshots are staged deterministically with `?shot=start|play|end`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=31w76kz9&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
