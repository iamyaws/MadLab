# Mad Inventor Lab · Design Spec

**Date:** 2026-05-03
**Status:** Design locked, ready for implementation planning
**Working title (English, internal):** Mad Inventor Lab
**Product name (German, kid-facing):** TBD (candidates: *Verrückte Werkstatt*, *Tüftel-Stube*, *Der Erfinder-Laden*)

---

## Overview

A browser-first PWA where the player runs a tiny mad inventor's workshop. Each round a customer arrives via a pneumatic tube with a weird request, the player picks 4 parts from a 3D-tilted orbit, the contraption auto-builds inside a glass-dome test chamber, the customer reacts based on how the invention's trait fingerprint matches their preference, and new parts unlock as a tip.

The product anchors on five governing bets:
1. Auto-resolved core loop (decisions concentrated between rounds, no real-time dexterity)
2. Collection-as-identity (the catalogue IS the player's identity)
3. Cosmetic as status, never as power (no pay-to-win, no power scaling)
4. Discovery loop built outside the product (clipworthy moments, weird pulls, share artifacts)
5. Free + cosmetic + optional one-time premium (post-MVP)

Target audience: 6-9 year olds, with the hard test at the 6-7 end. Universal vocabulary only. Reading is optional.

---

## Core loop (30-60 seconds per round)

```
[customer arrives via tube]
       ↓
[player taps 4 parts in the orbit]
       ↓
[contraption auto-builds, parts visible on workbench]
       ↓
[test reveal in glass dome, behavior verbs fire simultaneously]
       ↓
[trait sensors light up: Fun, Zappy, Cozy, Boom each show 0-3 dots]
       ↓
[customer reacts: delight / satisfied / sort-of / glorious fail]
       ↓
[reward: catalogue entry saved, possibly +1 part unlocked]
       ↓
[next customer arrives]
```

Run length: 5-10 customers per session, but no enforced session boundary. Player closes the tab when bored, reopens later, parts and catalogue persist.

---

## Meta-loop

**Endless catalogue.** Every invention saved with thumbnail, parts used, customer name, trait fingerprint, date, tier. Identity surface. Browsable as a flipbook (two-page spreads, painted invention left + test result right).

**Daily Special: themed weeks.** Each week features one rare visitor across 7 days. The visitor returns daily with escalating rewards, climaxing on Day 7 with a legendary part. Examples: Moonling Week, Captain Hooks Week, Tinker Week. Wordle-cadence with continuity.

**No fail state.** Every invention produces a result. Some make customers cheer, some make them throw it back hilariously. Both feel survivable.

**No scarcity.** Parts unlocked once stay unlocked. Inventory grows over time.

---

## The five governing bets (rationale)

These are the design principles that constrained every decision in this spec.

**1. Auto-resolved core loop.** Real-time dexterity is a gate that excludes the 6-7 end of the audience. Every meaningful decision happens between rounds (which parts, which path), never during. The cadence is one decision every 30-60 seconds, watch the consequence resolve, decide again. PokéRogue, pokelike.xyz, Pet Sim 99, Backpack Battles all converge here.

**2. Collection-as-identity.** "What I have" beats "what I can do" for 6-9. The catalogue is the social-signaling surface. Like Pokédex, like LEGO Skywalker's 500+ characters, like a card binder. Whatever the kid shows their friend at school the next day.

**3. Cosmetic as status, never as power.** Skins, character variants, palette themes do not confer competitive advantage. Pay-to-win is the most parent-rejected monetization pattern. This is non-negotiable.

**4. Discovery loop built outside the product.** Onboarding is largely irrelevant. Growth comes from clipworthy artifacts: weird inventions, glorious test failures, rare-pull moments, completed catalogue pages that work as TikTok / YouTube Shorts content. The product surfaces "share this run" prominently.

**5. Free + cosmetic + optional one-time premium.** No IAP-heavy stamina-gated mobile model. Free baseline, optional cosmetic packs, optional $3-5 one-time premium for ad-free / cloud save / starter cosmetic pack. Parents trust this monetization shape.

---

## The trait system

**Four traits, 0-3 scale each:**

| Trait | Glyph | Meaning |
|-------|-------|---------|
| Fun   | 😊    | Joyful, makes the customer laugh |
| Zappy | ⚡    | Energetic, sparking, mechanical |
| Cozy  | 🧶    | Soft, comforting, familiar |
| Boom  | 💥    | Loud, big, dramatic |

**Each part contributes to traits.** A spring contributes Fun + Zappy. A sock contributes Cozy. A bolt contributes Zappy + Boom. Trait scores sum across the 4 picked parts (capped at 3 per trait).

**Each customer wants a trait fingerprint.** Pip wants Cozy + Fun. Sir Crunch wants Boom + Zappy. Twig wants Cozy and is forbidden from Boom. Etc.

**Reaction tier is derived:**

| Tier | Condition | Animation hook |
|------|-----------|----------------|
| Delight | All wanted traits ≥ 2, no forbidden present | Glowing aura, customer cheers, rare reward, possible part unlock |
| Satisfied | All wanted traits ≥ 1, no forbidden | Smile, normal star reward |
| Sort-of-works | One wanted trait present | Head tilt, small reward |
| Glorious fail | Zero wanted, OR forbidden trait fires at any level | Customer throws it back hilariously, small reward |

For 6-7, the rules stay implicit. The kid learns by pattern recognition over plays ("the King smiled when I used jelly, I'll use jelly again"). No tooltips, no rule explanations.

**Target outcome distribution** (tunable via roster balance):
- Delight: 5%
- Satisfied: 50%
- Sort-of: 35%
- Glorious fail: 10%

---

## Customer roster (MVP)

### 6 regulars

| ID | Name | Visual | Request | Wants | Forbidden | Unlocks |
|----|------|--------|---------|-------|-----------|---------|
| pip | Pip | Pink blob creature | "a chair that hugs back" | Cozy + Fun | · | · |
| bo | Bo | 7-year-old kid in cyan hoodie | "my goldfish is bored, fix him" | Fun + Zappy | · | Scope (first delight) |
| oma | Oma | Gran with knitting yarn ball | "make me something that whistles when the kettle boils" | Cozy + Zappy | · | · |
| crunch | Sir Crunch | Tin-knight robot | "I lost my squeak, build me a new one" | Boom + Zappy | · | Magnet glove (first delight) |
| twig | Twig | Sage forest creature | "the wind is too loud, hush it for me" | Cozy | Boom | · |
| kit | Kit | Paper-bag ghost | "scare the cat please" | Boom + Fun | · | Eye (first delight) |

### 7 daily-special visitors (themed weeks)

Each visitor anchors a 7-day arc. Visits every evening that week, with escalating rewards across the 7 days, climaxing in a legendary part on day 7.

| ID | Name | Visual | Themed-week request |
|----|------|--------|---------------------|
| moonling | Moonling | Gold crescent visitor | "send me home before sundown" |
| hooks | Captain Hooks | Pirate in a bathtub | "find my lost map" |
| tinker | Tinker | Clockwork mouse | "wind me up forever" |
| beep | Beep | Alien postman | "deliver this to a planet I forgot" |
| snorri | Snorri | Sleepy dragon | "wake me up gently" |
| whisp | Whisp | Cloud-being | "carry me without dropping me" |
| doc | Doc | Old inventor | "fix what I couldn't" |

7 themed weeks cycle through year. 52 weeks ÷ 7 visitors = each visitor returns ~7-8 times per year, which is a satisfying enough rhythm for daily-ritual cadence.

---

## Part roster (MVP: 12, with 3 locked)

### 9 starter parts (visible from start)

| ID | Name | Category | Behavior verb | Trait contribution |
|----|------|----------|----------------|---------------------|
| cog | Cog | mechanical | spin | Zappy +1 |
| spring | Spring | mechanical | bounce | Fun +1, Zappy +1 |
| bolt | Bolt | mechanical | spark | Zappy +1, Boom +1 |
| beaker | Beaker | energy | puff | Boom +1 |
| bell | Bell | sensory | chime | Fun +1, Cozy +1 |
| jelly | Jelly | material | wobble | Fun +1, Cozy +1 |
| sock | Sock | material | soft | Cozy +2 |
| feather | Feather | material | flutter | Cozy +1, Fun +1 |
| cloud | Cloud | sensory | glow | Cozy +1, Zappy +1 |

### 3 locked unlock-pool parts

| ID | Name | Category | Behavior verb | Trait contribution | Unlock condition |
|----|------|----------|----------------|---------------------|-------------------|
| magnet | Magnet glove | mechanical | attract | Zappy +1, Boom +1 | Sir Crunch's first delight |
| eye | Eye | sensory | watch | Fun +1, Boom +1 | Kit's first delight |
| scope | Scope | sensory | zoom | Zappy +1, Fun +1 | Bo's first delight |

Parts are single SVG icons. Names appear as Caveat-font labels on hover or tap.

---

## Procedural composition

Each round, when the player taps "Fire it up!":

1. **Place parts** on the workbench using `attach_hints` (largest at base, smallest on top, randomized within constraints). The visible composition is literally the 4 parts arranged.
2. **Animate** all behavior verbs simultaneously for 3-4 seconds (cog spins, spring bounces, jelly wobbles, lightning crackles, etc).
3. **Customer interacts.** Customer walks up, touches it, reacts.
4. **Sensors light up live** during animation: Fun / Zappy / Cozy / Boom each show 0-3 dots based on the summed trait score.
5. **Reaction tier resolves** based on the trait match against the customer's fingerprint.

Every combo of 4 parts produces a visually unique invention because every combo has different parts on screen. The catalogue thumbnails are auto-generated from the part composition.

---

## Screens (matching wireframe v2)

All seven screens defined in the locked hi-fi-c.html wireframe. Brief implementation notes per screen.

### C1 Workshop (main loop)

- Status bar + dynamic island
- Nav: "Workshop" eyebrow, "The Lab" title, star count chip
- Customer hero card: portrait + arrival eyebrow + request quote + wants chips
- Pneumatic tube spine on the right (24px wide)
- Orbit stage with 8 visible parts + central upright contraption + SFX notes
- Status row: "3 / 4 picked" chip + live trait fingerprint preview
- Action: Shuffle (ghost) + "Fire it up!" (primary)
- Tab bar: Lab (active) / Catalogue / Shop / Daily

### C2 Customer arrival

- "★ NEW · Bo (kid)" chip + skip icon
- Tube spine + drop animation
- Customer character (180px), speech bubble request, wants chips
- "OK, let's build! ➜" CTA

### C3 Build (pick parts)

- Larger orbit (300px, 12 parts including locked)
- Center contraption
- "Your build · predicting" card with live fingerprint preview + selected parts as gold chips + "+ add" dashed slots
- Reset (ghost) + Build! (primary)

### C4 Test reveal

- Glass-dome chamber with customer left, contraption right
- Sparks fly outward (22 in big mode, 8 in quiet mode)
- Screen shake on big mode
- Sensor card: 4 cells (Fun, Zappy, Cozy, Boom) with name + glyph + 0-3 dot count, lighting up live
- Replay (ghost) + Skip (primary)

### C5 Reaction + unlock

- "Pip's reaction · Delight!" header with "★ all 4 high" chip
- Customer hero card with quote and reaction
- Gold "+1 part unlocked" card with new part icon, name, and unlock attribution ("Sir Crunch's first delight")
- Catalogue entry preview with thumbnail, name, parts list, trait fingerprint scoreline
- Share (ghost) + Next (primary)

### C6 Catalogue / Flipbook

- "Your collection / Flipbook" nav
- Filter chips: All / Rare / By customer
- Two-page spread: invention painting left, test result right
- Each page shows: name, "for [Customer] · [date]", trait fingerprint, parts list
- Pagination: ◀ chip ▶
- Tab bar: Catalogue active

### C7 Daily Special

- "★ DAY 1 of 7 · Moonling Week" chip + countdown chip
- Dark daily card with sparkle aura + customer + name + week subtitle
- Speech bubble request
- Week progress card: 7 dots (M/T/W/T/F/S/S) showing today highlighted
- Today's reward card (gold): list with current and Day 7 climax reward
- "Help Moonling ➜" CTA
- Tab bar: Daily active

---

## Visual system

**Three art directions, switchable via Tweaks:**

| Direction | Vibe | Default? |
|-----------|------|----------|
| Cel-shaded | Bold cel-shaded with bright primaries (cyan + gold + plum + rose + sage) on warm cream | ✅ default |
| Watercolor | Studio Ghibli adjacent, muted painterly | alt |
| Ink | Parchment + ink with marker color pops | alt |

**Color palette (cel-shaded default):**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FFE9C4` | Background base (warm cream) |
| `--bg-2` | `#FFD089` | Background accent (orange-cream) |
| `--paper` | `#FFFBEF` | Card surface |
| `--ink` | `#1F1A2A` | Text + borders (deep purple-black) |
| `--ink-soft` | `#6A6275` | Secondary text |
| `--primary` | `#3CC4DA` | Cyan |
| `--primary-deep` | `#1F88A0` | Cyan deep |
| `--gold` | `#FFC93C` | Accent gold |
| `--plum` | `#B970D2` | Plum |
| `--rose` | `#FF6F61` | Coral / customer accent |
| `--sage` | `#7DD66F` | Sage / forest creatures |

**Typography:**

| Font | Weight | Usage |
|------|--------|-------|
| Fraunces | 700-900 | Titles, headings, customer quotes |
| Nunito | 500-900 | UI text, buttons, eyebrows, chips |
| Caveat | 700 | SFX labels, hand-notes, "tap to swap" |

**Border radii:** 14 / 20 / 28 / 36px range. Soft and kid-friendly.

**Shadows:** 3-5px hard offsets (`0 3px 0 rgba(31,26,42,.18)`) for tactile feel.

**Stroke widths:** 2.5px borders throughout. Bold and friendly.

**Phone shell (design canvas reference):** 390 × 820px, 48px corner radius, dynamic island at top.

---

## Tech stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build | Vite | Fast, familiar (BeyArena / Ronki) |
| Framework | React 18 + TypeScript | Familiar, good UI ergonomics |
| Styling | Tailwind CSS | Utility-first, design-token friendly |
| Canvas | PixiJS via `@pixi/react` | 2D WebGL renderer for sprite-heavy workshop scene; significantly better Fire-tablet performance than DOM with 15-30 simultaneous animated layers |
| UI animation | `motion` (Framer Motion successor) | For UI shell animations (chips, cards, transitions) |
| State | React state + localStorage persistence | No accounts, no cloud, single device for MVP |
| PWA | Vite-PWA plugin + manifest | Installable feel |
| Sound | HTMLAudioElement gated through AudioContext | iOS silent-switch reliability |

**Boundary between Pixi and React:**
- React + Tailwind owns: nav bar, tab bar, customer hero card, speech bubbles, catalogue grid, daily card, all chrome
- Pixi `<Stage>` owns: orbit + parts + central contraption (workshop main view), test chamber animations, particle effects, behavior verb animations

This split keeps UI work fast (React/Tailwind/motion) and animation work performant (Pixi WebGL).

**No backend at MVP.** Add Supabase post-MVP for cloud save and child-account anonymous auth.

---

## iOS HIG layer (default polish checklist)

Adopting the BeyArena pattern, every Phase 3 build passes through this list:

- ✅ 44pt minimum tap targets (parts in inventory grid, especially)
- ✅ 56-64pt button heights (kid-safe, exceeds HIG minimum), already at wireframe level
- ✅ Safe area insets (notch, home indicator) via `env(safe-area-inset-*)` CSS
- ✅ `prefers-reduced-motion` respected: disable behavior verb animations, fade-cut to outcome instead, already wired in wireframe
- ✅ Haptic feedback on build success, reaction reveal, daily special unlock (where supported)
- ✅ Sound respects silent switch (AudioContext gating, not HTML5 `<audio>`)
- ✅ PWA install prompt styled for iOS (Add-to-Home-Screen guidance, since iOS doesn't trigger `beforeinstallprompt`)
- ✅ VoiceOver labels on customer, parts, reaction (basic semantic labels)
- ✅ No modal dialogs during the test reveal (uninterruptible dopamine beat)
- ✅ Friendly error / failure states ("Hmm, das hat nicht ganz geklappt. Nochmal?" beats generic "Error")
- ✅ Dark mode skipped for MVP (single workshop mood is fine)

---

## German-first localization

- All kid-facing copy in German
- Use `du`, never `Sie`
- First-grader vocabulary, no abstract verbs, no tech jargon
- German UI text is ~30% longer than English on average; design with breathing room (chips, buttons, request lines)
- Working title (English) stays internal; product name (German) chosen before public launch

**Customer name considerations:** Pip, Bo, Kit work in German. Oma is German. Sir Crunch translates as "Sir Knirps" or stays English for kid-cool. Twig might become "Reiserle" or stay English. Final naming locked at content-fill phase.

**Daily-special name considerations:** Moonling stays. Captain Hooks → "Käpt'n Haken." Tinker → "Tüftler." Beep stays. Snorri stays. Whisp → "Wölkchen." Doc stays.

---

## MVP scope (6-week solo dev)

### Phase 1 (week 1-2): Core loop spike

Goal: end-to-end loop runs with placeholder art.

- Vite + React + TypeScript scaffold
- Tailwind config with the cel-shaded palette as design tokens
- PixiJS + `@pixi/react` setup
- 3 placeholder customers, 6 placeholder parts (boxes with text)
- Composition algorithm (parts → trait sums → reaction tier)
- Workshop screen with orbit (Pixi)
- Test reveal animation (sparks, sensor cells)
- Reaction screen
- Catalogue grid with localStorage persistence

### Phase 2 (week 3-4): Content fill

Goal: Louis tests it.

- 6 customers with finished SVG art + requests + reactions
- 12 parts with sprites + behavior verb animations
- Daily Special "Moonling Week" wired (week 1 only)
- SFX (chime on build, swoosh on tube drop, ka-thunk on test)
- Workshop, Arrival, Build, Test, Reaction, Flipbook, Daily screens implemented from wireframe v2
- Tab bar functional

### Phase 3 (week 5-6): Polish + ship

Goal: shippable to public URL.

- Subtle onboarding (Infinite Craft style, no walls of text)
- Sound mixing
- iOS HIG polish pass (full checklist above)
- PWA manifest + install prompt
- Performance pass: profile on a real Fire tablet, target 30 layers max simultaneously
- Mobile (touch) tuning, especially Build screen
- Watercolor + ink alt palettes wired (optional, can defer)

---

## Out of scope (deliberate cuts)

- Cosmetics shop (post-MVP)
- Any monetization (post-MVP)
- Accounts / cloud save (post-MVP, Supabase migration)
- Multi-language (German only at MVP)
- Achievements / badges
- Full sharing features beyond catalogue page screenshot
- Onboarding tutorial walls
- Settings screen
- Audio beyond minimal SFX
- Run-based session structure (committed to endless)
- Bolt / lightning currency (stars only)

---

## Open questions / deferred decisions

These were noted but did not block the spec. Resolve before shipping or during their phase:

1. **German product name.** Decide before public-facing assets. Top candidates: *Verrückte Werkstatt*, *Tüftel-Stube*, *Der Erfinder-Laden*.
2. **Specific reward economy.** What does Day 1-6 reward look like during a themed week? Currently "Day 7: legendary part" is the climax; Days 1-6 need a defined ladder (cosmetic stickers, bonus star points, art pieces).
3. **Catalogue page art generation.** Phase 2 question. Either procedural (auto-render from part composition) or AI-assisted at runtime. Phase 1 uses placeholder thumbs.
4. **Onboarding flow.** Phase 3 question. Likely: silent guided first-customer flow with no skippable tutorial walls.
5. **Sound design library.** Phase 2 question. Source / commission ~15-20 SFX clips matching the behavior verb library.
6. **Cloud-save migration plan.** Post-MVP. Anonymous Supabase auth, parent-claim flow if/when account features arrive.

---

## Testing approach

This is a kid-facing product where the validation gate is "does Louis play it for 10 minutes without prompting." Testing for the design spec splits into three layers:

**1. Unit / logic tests** (Vitest)
- Trait scoring math: given parts P, sum trait contributions correctly with cap at 3
- Reaction tier resolution: given trait scores S and customer C, return correct tier
- Daily-week rotation: given current date, return correct visitor + day-in-week
- Part-unlock conditions: given event log, return parts unlocked

**2. Component snapshot tests** (Vitest + @testing-library/react)
- Workshop, Arrival, Build, Test, Reaction, Flipbook, Daily screens render with representative state
- Customer character SVG renders for all 6 + 7 daily kinds
- Fingerprint component renders 4 traits × 0-3 dots correctly

**3. Playtests with kids** (the real validation)
- Louis (6, primary tester) at end of Phase 1 (placeholder art) and Phase 2 (finished art)
- 1-2 additional kids (school playground, 7-9) at end of Phase 2
- Parent-observation pass on Phase 3 polish (do they trust it? would they install?)

No E2E test framework for MVP. The screen surface is small (7 screens), and manual playtesting catches real issues faster.

---

## References

- **Wireframe v2 hi-fi C**: copy into `docs/wireframes/hifi-c-v2.html` from `C:\Users\AF08~1\AppData\Local\Temp\madinv-handoff-v2\mad-lab\project\hifi-c.html` as the visual source-of-truth
- **Research files** in Marc's outputs folder:
  - `gameloops_6-9_research_brief.md` (master synthesis)
  - `pwa-newly-released-gameloops.md` (PokéRogue, Infinite Craft, neal.fun ecosystem)
  - `creature_collector_archetypes_research.md` (adjacent archetypes)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/): default polish reference
- [Infinite Craft](https://neal.fun/infinite-craft): closest-existing-thing for the catalogue loop
- [PokéRogue](https://pokerogue.net): auto-resolution loop reference (audience skews older than ours)
